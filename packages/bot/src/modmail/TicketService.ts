import { renderMessage, renderPrefix } from "@modmail/core";
import {
  and,
  type Database,
  desc,
  eq,
  type JsonObject,
  schema,
  sql,
  type Ticket,
} from "@modmail/db";
import {
  ChannelType,
  type Client,
  type DMChannel,
  type GuildMember,
  type Message,
  type TextChannel,
  type ThreadChannel,
} from "discord.js";
import { fetchMemberSafe } from "../lib/discord.ts";
import type { Logger } from "../logger.ts";
import type { ResolvedSettings, SettingsService } from "../settings/service.ts";
import { createInbox, getWebhook } from "./inbox.ts";

interface RelayTarget {
  webhookChannel: TextChannel;
  threadId: string | null;
  postChannel: TextChannel | ThreadChannel;
}

export interface CreateTicketOptions {
  guildId: string;
  userId: string;
  openedById: string;
  openedByStaff: boolean;
  reason?: string | null;
  comment?: string | null;
  categoryId?: string | null;
  /** the message that triggered creation (relayed as the first user message) */
  firstMessage?: Message | null;
}

export class TicketService {
  constructor(
    private client: Client,
    private db: Database,
    private settings: SettingsService,
    private logger: Logger,
  ) {}

  // ─── queries ───────────────────────────────────────────────────────────

  findOpenByChannel(channelId: string): Promise<Ticket | undefined> {
    return this.db.query.tickets.findFirst({
      where: and(eq(schema.tickets.channelId, channelId), eq(schema.tickets.status, "open")),
    });
  }

  findOpenInGuild(guildId: string, userId: string): Promise<Ticket | undefined> {
    return this.db.query.tickets.findFirst({
      where: and(
        eq(schema.tickets.guildId, guildId),
        eq(schema.tickets.userId, userId),
        eq(schema.tickets.status, "open"),
      ),
    });
  }

  /** All open tickets for a user across every guild. */
  findOpenByUser(userId: string): Promise<Ticket[]> {
    return this.db.query.tickets.findMany({
      where: and(eq(schema.tickets.userId, userId), eq(schema.tickets.status, "open")),
    });
  }

  async isBlocked(guildId: string, userId: string): Promise<boolean> {
    const row = await this.db.query.blockedUsers.findFirst({
      where: and(eq(schema.blockedUsers.guildId, guildId), eq(schema.blockedUsers.userId, userId)),
    });
    if (!row) return false;
    if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
      await this.db.delete(schema.blockedUsers).where(eq(schema.blockedUsers.id, row.id));
      return false;
    }
    return true;
  }

  private async allocateNumber(guildId: string): Promise<number> {
    const [row] = await this.db
      .select({
        max: sql<number>`coalesce(max(${schema.tickets.number}), 0)`,
      })
      .from(schema.tickets)
      .where(eq(schema.tickets.guildId, guildId));
    return (row?.max ?? 0) + 1;
  }

  // ─── creation ──────────────────────────────────────────────────────────

  async createTicket(opts: CreateTicketOptions): Promise<Ticket> {
    const settings = await this.settings.get(opts.guildId);
    if (!settings) throw new Error("Guild not configured");

    const guild = await this.client.guilds.fetch(opts.guildId);
    const member = await fetchMemberSafe(guild, opts.userId);
    if (!member) throw new Error("User is not a member of the server");

    const dm = await member.user.createDM().catch(() => null);
    if (!dm) throw new Error("Cannot DM the user");

    const number = await this.allocateNumber(opts.guildId);

    let categoryOverrideId: string | null = null;
    if (opts.categoryId) {
      const cat = await this.db.query.ticketCategories.findFirst({
        where: eq(schema.ticketCategories.id, opts.categoryId),
      });
      categoryOverrideId = cat?.inboxChannelId ?? null;
    }

    const inbox = await createInbox(guild, settings, {
      member,
      userId: opts.userId,
      username: member.user.username,
      number,
      categoryOverrideId,
    });

    const [ticket] = await this.db
      .insert(schema.tickets)
      .values({
        guildId: opts.guildId,
        number,
        userId: opts.userId,
        openedById: opts.openedById,
        openedByStaff: opts.openedByStaff,
        channelId: inbox.channelId,
        dmChannelId: dm.id,
        reason: opts.reason ?? null,
        comment: opts.comment ?? null,
        status: "open",
      })
      .returning();
    if (!ticket) throw new Error("Failed to create ticket");

    await this.postInfoEmbed(ticket, member, settings).catch((e) =>
      this.logger.error({ err: e }, "failed to post info embed"),
    );

    // greeting DM
    if (!opts.openedByStaff && settings.config.greetingEnabled) {
      const payload = renderMessage(settings.config.greetingMessage, {
        user: member.user.username,
        server: guild.name,
        reason: opts.reason ?? "",
        number,
        ticketId: ticket.id,
      });
      await this.sendDM(dm, payload).catch(() => null);
    }

    // ping roles
    if (settings.config.pingOnNewTicket && settings.config.pingRoleIds.length) {
      const target = await this.resolveRelayTarget(ticket);
      if (target) {
        await target.postChannel
          .send({
            content: settings.config.pingRoleIds.map((id) => `<@&${id}>`).join(" "),
          })
          .then((m) => setTimeout(() => m.delete().catch(() => null), 1500))
          .catch(() => null);
      }
    }

    // relay the message that started the ticket
    if (opts.firstMessage) {
      await this.relayUserMessage(ticket, opts.firstMessage).catch(() => null);
    }

    await this.audit(opts.guildId, opts.openedById, "ticket.open", "ticket", ticket.id);
    return ticket;
  }

  private async postInfoEmbed(
    ticket: Ticket,
    member: GuildMember,
    settings: ResolvedSettings,
  ): Promise<void> {
    const target = await this.resolveRelayTarget(ticket);
    if (!target) return;
    const user = member.user;
    const roles = [...member.roles.cache.values()]
      .filter((r) => r.id !== member.guild.id)
      .map((r) => `<@&${r.id}>`)
      .join(" ");

    const msg = await target.postChannel.send({
      embeds: [
        {
          color: parseInt(settings.config.accentColor.replace("#", ""), 16),
          author: {
            name: `${user.username} • Ticket #${ticket.number}`,
            icon_url: user.displayAvatarURL(),
          },
          fields: [
            { name: "User", value: `<@${user.id}> \`${user.id}\``, inline: false },
            {
              name: "Account created",
              value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
              inline: true,
            },
            {
              name: "Joined",
              value: member.joinedTimestamp
                ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
                : "Unknown",
              inline: true,
            },
            ...(ticket.reason ? [{ name: "Reason", value: ticket.reason, inline: false }] : []),
            ...(roles ? [{ name: "Roles", value: roles, inline: false }] : []),
          ],
        },
      ],
      components: [
        {
          type: 1,
          components: [
            { type: 2, style: 4, label: "Close", custom_id: "ticket:close" },
            { type: 2, style: 2, label: "Claim", custom_id: "ticket:claim" },
            { type: 2, style: 1, label: "Snippet", custom_id: "ticket:snippet" },
          ],
        },
      ],
    });
    await this.db
      .update(schema.tickets)
      .set({ infoMessageId: msg.id })
      .where(eq(schema.tickets.id, ticket.id));
  }

  // ─── relay ─────────────────────────────────────────────────────────────

  private async resolveRelayTarget(ticket: Ticket): Promise<RelayTarget | null> {
    if (!ticket.channelId) return null;
    const channel = await this.client.channels.fetch(ticket.channelId).catch(() => null);
    if (!channel) return null;

    if (channel.isThread()) {
      const parent = channel.parent;
      if (!parent || parent.type !== ChannelType.GuildText) return null;
      return {
        postChannel: channel,
        webhookChannel: parent as TextChannel,
        threadId: channel.id,
      };
    }
    if (channel.type === ChannelType.GuildText) {
      return {
        postChannel: channel,
        webhookChannel: channel,
        threadId: null,
      };
    }
    return null;
  }

  /** Relay a user's DM into the inbox. */
  async relayUserMessage(ticket: Ticket, message: Message): Promise<void> {
    const target = await this.resolveRelayTarget(ticket);
    if (!target) return;
    const webhook = await getWebhook(target.webhookChannel);

    const content = this.messageToString(message);
    const sent = await webhook.send({
      threadId: target.threadId ?? undefined,
      username: message.author.username,
      avatarURL: message.author.displayAvatarURL(),
      content: content.slice(0, 2000) || "_ _",
      allowedMentions: { parse: [] },
    });

    await this.db.insert(schema.ticketMessages).values({
      ticketId: ticket.id,
      type: "user",
      authorId: message.author.id,
      authorTag: message.author.username,
      authorAvatar: message.author.displayAvatarURL(),
      content,
      dmMessageId: message.id,
      channelMessageId: sent.id,
      attachments: [...message.attachments.values()].map((a) => ({
        url: a.url,
        name: a.name,
        contentType: a.contentType ?? undefined,
      })),
    });

    await this.db
      .update(schema.tickets)
      .set({ lastUserMessageAt: new Date() })
      .where(eq(schema.tickets.id, ticket.id));

    await this.notifySubscribers(ticket, message.author.username);
  }

  /** Staff reply: DM the user and mirror into the inbox. */
  async sendStaffReply(
    ticket: Ticket,
    opts: {
      authorId: string;
      authorTag: string;
      authorAvatar: string;
      content: string;
      anonymous: boolean;
      snippetId?: string | null;
    },
  ): Promise<{ ok: boolean; error?: string }> {
    const settings = await this.settings.get(ticket.guildId);
    if (!settings) return { ok: false, error: "Not configured" };

    const dm = await this.fetchDM(ticket);
    if (!dm) return { ok: false, error: "Cannot DM the user" };

    const prefix = opts.anonymous
      ? settings.config.dmReplyPrefixAnonymous
      : settings.config.dmReplyPrefixStaff;
    const dmContent = renderPrefix(prefix, {
      staff: opts.authorTag,
      user: opts.authorTag,
      message: opts.content,
    });

    const dmMsg = await dm
      .send({ content: dmContent.slice(0, 2000), allowedMentions: { parse: [] } })
      .catch(() => null);
    if (!dmMsg) return { ok: false, error: "User has DMs disabled" };

    const target = await this.resolveRelayTarget(ticket);
    let channelMessageId: string | null = null;
    if (target) {
      const webhook = await getWebhook(target.webhookChannel);
      const label = opts.anonymous ? "Staff (anonymous)" : `${opts.authorTag} • Staff`;
      const sent = await webhook
        .send({
          threadId: target.threadId ?? undefined,
          username: label,
          avatarURL: opts.anonymous ? undefined : opts.authorAvatar,
          content: opts.content.slice(0, 2000),
          allowedMentions: { parse: [] },
        })
        .catch(() => null);
      channelMessageId = sent?.id ?? null;
    }

    await this.db.insert(schema.ticketMessages).values({
      ticketId: ticket.id,
      type: "staff",
      authorId: opts.authorId,
      authorTag: opts.authorTag,
      authorAvatar: opts.authorAvatar,
      content: opts.content,
      anonymous: opts.anonymous,
      dmMessageId: dmMsg.id,
      channelMessageId,
      snippetId: opts.snippetId ?? null,
    });

    const now = new Date();
    await this.db
      .update(schema.tickets)
      .set({
        lastStaffMessageAt: now,
        firstResponseAt: ticket.firstResponseAt ?? now,
      })
      .where(eq(schema.tickets.id, ticket.id));

    if (opts.snippetId) {
      await this.db
        .update(schema.snippets)
        .set({ uses: sql`${schema.snippets.uses} + 1` })
        .where(eq(schema.snippets.id, opts.snippetId));
    }

    return { ok: true };
  }

  async addInternalNote(
    ticket: Ticket,
    opts: { authorId: string; authorTag: string; authorAvatar: string; content: string },
  ): Promise<void> {
    await this.db.insert(schema.ticketMessages).values({
      ticketId: ticket.id,
      type: "internal",
      authorId: opts.authorId,
      authorTag: opts.authorTag,
      authorAvatar: opts.authorAvatar,
      content: opts.content,
    });
  }

  /** Edit a previously-sent staff message (by channel/webhook message id). */
  async editStaffMessage(
    ticket: Ticket,
    channelMessageId: string,
    newContent: string,
  ): Promise<boolean> {
    const row = await this.db.query.ticketMessages.findFirst({
      where: and(
        eq(schema.ticketMessages.ticketId, ticket.id),
        eq(schema.ticketMessages.channelMessageId, channelMessageId),
      ),
    });
    if (!row?.dmMessageId) return false;

    const dm = await this.fetchDM(ticket);
    const settings = await this.settings.get(ticket.guildId);
    if (!dm || !settings) return false;

    const prefix = row.anonymous
      ? settings.config.dmReplyPrefixAnonymous
      : settings.config.dmReplyPrefixStaff;
    const edited = await dm.messages
      .edit(row.dmMessageId, {
        content: renderPrefix(prefix, {
          staff: row.authorTag ?? "Staff",
          message: newContent,
        }).slice(0, 2000),
      })
      .then(() => true)
      .catch(() => false);
    if (!edited) return false;

    const target = await this.resolveRelayTarget(ticket);
    if (target) {
      const webhook = await getWebhook(target.webhookChannel);
      await webhook
        .editMessage(channelMessageId, {
          threadId: target.threadId ?? undefined,
          content: newContent.slice(0, 2000),
        })
        .catch(() => null);
    }

    await this.db
      .update(schema.ticketMessages)
      .set({ content: newContent, edited: true })
      .where(eq(schema.ticketMessages.id, row.id));
    return true;
  }

  async deleteStaffMessage(ticket: Ticket, channelMessageId: string): Promise<boolean> {
    const row = await this.db.query.ticketMessages.findFirst({
      where: and(
        eq(schema.ticketMessages.ticketId, ticket.id),
        eq(schema.ticketMessages.channelMessageId, channelMessageId),
      ),
    });
    if (!row?.dmMessageId) return false;

    const dm = await this.fetchDM(ticket);
    if (dm) await dm.messages.delete(row.dmMessageId).catch(() => null);

    const target = await this.resolveRelayTarget(ticket);
    if (target) {
      const webhook = await getWebhook(target.webhookChannel);
      await webhook.deleteMessage(channelMessageId, target.threadId ?? undefined).catch(() => null);
    }

    await this.db
      .update(schema.ticketMessages)
      .set({ deleted: true })
      .where(eq(schema.ticketMessages.id, row.id));
    return true;
  }

  /** Sync an edited user DM into the inbox mirror. */
  async syncUserEdit(ticket: Ticket, message: Message): Promise<void> {
    const row = await this.db.query.ticketMessages.findFirst({
      where: and(
        eq(schema.ticketMessages.ticketId, ticket.id),
        eq(schema.ticketMessages.dmMessageId, message.id),
      ),
    });
    if (!row?.channelMessageId) return;
    const target = await this.resolveRelayTarget(ticket);
    if (!target) return;
    const webhook = await getWebhook(target.webhookChannel);
    const content = this.messageToString(message);
    await webhook
      .editMessage(row.channelMessageId, {
        threadId: target.threadId ?? undefined,
        content: `${content}\n\n-# edited`.slice(0, 2000),
      })
      .catch(() => null);
    await this.db
      .update(schema.ticketMessages)
      .set({ content, edited: true })
      .where(eq(schema.ticketMessages.id, row.id));
  }

  // ─── close ─────────────────────────────────────────────────────────────

  async close(
    ticket: Ticket,
    opts: { byId: string; byTag?: string; reason?: string | null; silent?: boolean },
  ): Promise<void> {
    const settings = await this.settings.get(ticket.guildId);

    await this.db
      .update(schema.tickets)
      .set({
        status: "closed",
        closedAt: new Date(),
        closedById: opts.byId,
        closeReason: opts.reason ?? null,
      })
      .where(eq(schema.tickets.id, ticket.id));

    // close DM
    if (settings && !opts.silent && settings.config.closeMessageEnabled) {
      const dm = await this.fetchDM(ticket);
      if (dm) {
        const guild = await this.client.guilds.fetch(ticket.guildId).catch(() => null);
        const payload = renderMessage(settings.config.closeMessage, {
          server: guild?.name ?? "the server",
          reason: opts.reason ?? "",
          ticketId: ticket.id,
          number: ticket.number,
        });
        await this.sendDM(dm, payload).catch(() => null);
      }
    }

    // log embed
    if (settings?.logChannelId) {
      const logChannel = await this.client.channels.fetch(settings.logChannelId).catch(() => null);
      if (logChannel && "send" in logChannel) {
        await (logChannel as TextChannel)
          .send({
            embeds: [
              {
                color: parseInt(settings.config.errorColor.replace("#", ""), 16),
                title: `Ticket #${ticket.number} closed`,
                description: [
                  `**User:** <@${ticket.userId}> \`${ticket.userId}\``,
                  `**Closed by:** <@${opts.byId}>`,
                  opts.reason ? `**Reason:** ${opts.reason}` : null,
                  `[View transcript](${process.env.DASHBOARD_URL ?? ""}/dashboard/${ticket.guildId}/tickets/${ticket.id})`,
                ]
                  .filter(Boolean)
                  .join("\n"),
                timestamp: new Date().toISOString(),
              },
            ],
          })
          .catch(() => null);
      }
    }

    // remove channel / archive thread
    const delaySec = settings?.config.deleteChannelAfterCloseSeconds ?? 10;
    const channelId = ticket.channelId;
    if (channelId) {
      setTimeout(() => {
        void this.client.channels
          .fetch(channelId)
          .then(async (c) => {
            if (!c) return;
            if (c.isThread()) {
              await c.setArchived(true, "Ticket closed").catch(() => null);
              await c.setLocked(true).catch(() => null);
            } else if ("delete" in c) {
              await c.delete("Ticket closed").catch(() => null);
            }
          })
          .catch(() => null);
      }, Math.max(0, delaySec) * 1000);
    }

    await this.audit(ticket.guildId, opts.byId, "ticket.close", "ticket", ticket.id);
  }

  // ─── helpers ─────────────────────────────────────────────────────────────

  private async fetchDM(ticket: Ticket): Promise<DMChannel | null> {
    if (ticket.dmChannelId) {
      const c = await this.client.channels.fetch(ticket.dmChannelId).catch(() => null);
      if (c && c.type === ChannelType.DM) return c as DMChannel;
    }
    const user = await this.client.users.fetch(ticket.userId).catch(() => null);
    if (!user) return null;
    return user.createDM().catch(() => null);
  }

  private async sendDM(
    dm: DMChannel,
    payload: { content?: string; embeds?: unknown[] },
  ): Promise<void> {
    if (!payload.content && !payload.embeds?.length) return;
    await dm.send(payload as never);
  }

  private async notifySubscribers(ticket: Ticket, username: string): Promise<void> {
    const subs = await this.db.query.ticketSubscriptions.findMany({
      where: eq(schema.ticketSubscriptions.ticketId, ticket.id),
    });
    if (!subs.length) return;
    const target = await this.resolveRelayTarget(ticket);
    if (!target) return;
    await target.postChannel
      .send({
        content: `New message from ${username} — ${subs.map((s) => `<@${s.userId}>`).join(" ")}`,
      })
      .then((m) => setTimeout(() => m.delete().catch(() => null), 2000))
      .catch(() => null);
  }

  private messageToString(message: Message): string {
    let out = message.content ?? "";
    if (message.attachments.size > 0)
      out += `\n${[...message.attachments.values()].map((a) => a.url).join("\n")}`;
    if (message.stickers.size > 0)
      out += `\n${[...message.stickers.values()].map((s) => s.name).join(" ")}`;
    return out.trim();
  }

  async audit(
    guildId: string,
    actorId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    metadata: JsonObject = {},
  ): Promise<void> {
    await this.db
      .insert(schema.auditLog)
      .values({ guildId, actorId, action, targetType, targetId, metadata, source: "bot" })
      .catch(() => null);
  }

  async recentTicketsByUser(guildId: string, userId: string): Promise<Ticket[]> {
    return this.db.query.tickets.findMany({
      where: and(eq(schema.tickets.guildId, guildId), eq(schema.tickets.userId, userId)),
      orderBy: desc(schema.tickets.createdAt),
      limit: 15,
    });
  }
}
