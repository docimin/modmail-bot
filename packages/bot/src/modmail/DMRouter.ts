import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
  type Client,
  type Message,
  type MessageComponentInteraction,
  type Guild,
  type GuildMember,
} from "discord.js";
import { and, eq, isNotNull, schema, type Database } from "@modmail/db";
import { renderMessage } from "@modmail/core";
import type { Logger } from "../logger.ts";
import type { SettingsService } from "../settings/service.ts";
import type { TicketService } from "./TicketService.ts";
import { isOutsideWorkingHours } from "../lib/workingHours.ts";

interface PendingFlow {
  message: Message;
  guildId?: string;
  categoryId?: string;
  expires: number;
}

interface MutualGuild {
  guild: Guild;
  member: GuildMember;
}

const FLOW_TTL = 5 * 60 * 1000;

export class DMRouter {
  private pending = new Map<string, PendingFlow>();
  private cooldowns = new Map<string, number>(); // `${guildId}:${userId}` -> ts

  constructor(
    private client: Client,
    private db: Database,
    private settings: SettingsService,
    private tickets: TicketService,
    private logger: Logger,
  ) {
    setInterval(() => this.sweep(), 60_000).unref?.();
  }

  private sweep(): void {
    const now = Date.now();
    for (const [k, v] of this.pending) if (v.expires < now) this.pending.delete(k);
  }

  async handleDM(message: Message): Promise<void> {
    if (message.author.bot) return;
    const userId = message.author.id;

    const open = await this.tickets.findOpenByUser(userId);
    if (open.length === 1) {
      await this.tickets.relayUserMessage(open[0]!, message);
      return;
    }
    if (open.length > 1) {
      await this.promptServerSelect(message, open.map((t) => t.guildId));
      return;
    }
    await this.startCreation(message);
  }

  private async getMutualEnabledGuilds(userId: string): Promise<MutualGuild[]> {
    const rows = await this.db.query.guildSettings.findMany({
      where: and(
        eq(schema.guildSettings.enabled, true),
        isNotNull(schema.guildSettings.inboxChannelId),
      ),
      columns: { guildId: true },
    });
    const out: MutualGuild[] = [];
    for (const { guildId } of rows) {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) continue;
      const member = await guild.members.fetch(userId).catch(() => null);
      if (member) out.push({ guild, member });
      if (out.length >= 25) break;
    }
    return out;
  }

  private async startCreation(message: Message): Promise<void> {
    const mutual = await this.getMutualEnabledGuilds(message.author.id);
    if (mutual.length === 0) {
      await message
        .reply(
          "I couldn't find any servers we share that have modmail enabled.",
        )
        .catch(() => null);
      return;
    }
    if (mutual.length === 1) {
      await this.beginForGuild(message, mutual[0]!.guild.id);
      return;
    }
    await this.promptServerSelect(
      message,
      mutual.map((m) => m.guild.id),
    );
  }

  private async promptServerSelect(
    message: Message,
    guildIds: string[],
  ): Promise<void> {
    this.pending.set(message.author.id, {
      message,
      expires: Date.now() + FLOW_TTL,
    });
    const options = guildIds
      .map((id) => this.client.guilds.cache.get(id))
      .filter((g): g is Guild => !!g)
      .slice(0, 25)
      .map((g) => ({ label: g.name.slice(0, 100), value: g.id }));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("dm:server")
        .setPlaceholder("Select a server")
        .addOptions(options),
    );
    await message
      .reply({
        embeds: [
          {
            color: 0x5865f2,
            title: "Which server?",
            description: "Select the server you'd like to open a ticket in.",
          },
        ],
        components: [row],
      })
      .catch(() => null);
  }

  async onServerSelect(
    interaction: MessageComponentInteraction,
    guildId: string,
  ): Promise<void> {
    const flow = this.pending.get(interaction.user.id);
    if (!flow) {
      await interaction.update({ content: "This selection expired.", components: [], embeds: [] }).catch(() => null);
      return;
    }
    flow.guildId = guildId;

    // existing open ticket in this guild?
    const existing = await this.tickets.findOpenInGuild(guildId, interaction.user.id);
    if (existing) {
      this.pending.delete(interaction.user.id);
      await interaction.deferUpdate().catch(() => null);
      await this.tickets.relayUserMessage(existing, flow.message);
      await interaction
        .editReply({ content: "Message delivered.", components: [], embeds: [] })
        .catch(() => null);
      return;
    }
    await this.continueCreation(interaction, flow);
  }

  private async beginForGuild(message: Message, guildId: string): Promise<void> {
    const flow: PendingFlow = {
      message,
      guildId,
      expires: Date.now() + FLOW_TTL,
    };
    this.pending.set(message.author.id, flow);
    await this.continueCreation(message, flow);
  }

  /** Run the gating checks + confirm/category step. `ctx` is a Message or interaction. */
  private async continueCreation(
    ctx: Message | MessageComponentInteraction,
    flow: PendingFlow,
  ): Promise<void> {
    const userId = "author" in ctx ? ctx.author.id : ctx.user.id;
    const guildId = flow.guildId!;
    const settings = await this.settings.get(guildId);
    if (!settings) return;

    const reply = async (payload: { content?: string; embeds?: unknown[]; components?: unknown[] }) => {
      if ("author" in ctx) await ctx.reply(payload as never).catch(() => null);
      else await ctx.update(payload as never).catch(() => null);
    };

    // blocked
    if (await this.tickets.isBlocked(guildId, userId)) {
      this.pending.delete(userId);
      const payload = renderMessage(settings.config.blockedMessage, {});
      await reply({ ...payload, components: [] });
      return;
    }

    // cooldown
    const cdKey = `${guildId}:${userId}`;
    const cd = settings.config.cooldownSeconds * 1000;
    const last = this.cooldowns.get(cdKey) ?? 0;
    if (cd > 0 && Date.now() - last < cd) {
      this.pending.delete(userId);
      await reply({ content: "You're opening tickets too quickly. Please wait a bit.", components: [], embeds: [] });
      return;
    }

    // account age gate
    const member = await this.client.guilds.cache.get(guildId)?.members.fetch(userId).catch(() => null);
    const minAccount = settings.config.minAccountAgeMinutes;
    if (member && minAccount > 0) {
      const ageMin = (Date.now() - member.user.createdTimestamp) / 60000;
      if (ageMin < minAccount) {
        this.pending.delete(userId);
        await reply({ content: "Your account is too new to open a ticket here.", components: [], embeds: [] });
        return;
      }
    }

    // category selection
    const categories = await this.db.query.ticketCategories.findMany({
      where: and(
        eq(schema.ticketCategories.guildId, guildId),
        eq(schema.ticketCategories.enabled, true),
      ),
    });

    if (categories.length > 0 && !flow.categoryId) {
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("dm:category")
          .setPlaceholder("Choose a category")
          .addOptions(
            categories.slice(0, 25).map((c) => ({
              label: c.name.slice(0, 100),
              value: c.id,
              description: c.description?.slice(0, 100),
              emoji: c.emoji ?? undefined,
            })),
          ),
      );
      await reply({
        embeds: [{ color: 0x5865f2, title: "What's this about?", description: "Pick a category to continue." }],
        components: [row],
      });
      return;
    }

    if (settings.config.confirmationEnabled) {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId("dm:confirm").setLabel("Open ticket").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("dm:cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger),
      );
      const serverName = this.client.guilds.cache.get(guildId)?.name ?? "this server";
      await reply({
        embeds: [
          {
            color: 0x5865f2,
            title: "Open a ticket?",
            description: `Send your message to the staff of **${serverName}**?`,
          },
        ],
        components: [row],
      });
      return;
    }

    await this.finalizeCreation(ctx, flow);
  }

  async onCategorySelect(
    interaction: MessageComponentInteraction,
    categoryId: string,
  ): Promise<void> {
    const flow = this.pending.get(interaction.user.id);
    if (!flow) {
      await interaction.update({ content: "This selection expired.", components: [], embeds: [] }).catch(() => null);
      return;
    }
    flow.categoryId = categoryId;
    await this.continueCreation(interaction, flow);
  }

  async onConfirm(interaction: MessageComponentInteraction): Promise<void> {
    const flow = this.pending.get(interaction.user.id);
    if (!flow) {
      await interaction.update({ content: "This request expired.", components: [], embeds: [] }).catch(() => null);
      return;
    }
    await this.finalizeCreation(interaction, flow);
  }

  async onCancel(interaction: MessageComponentInteraction): Promise<void> {
    this.pending.delete(interaction.user.id);
    await interaction
      .update({ content: "Cancelled.", components: [], embeds: [] })
      .catch(() => null);
  }

  private async finalizeCreation(
    ctx: Message | MessageComponentInteraction,
    flow: PendingFlow,
  ): Promise<void> {
    const userId = "author" in ctx ? ctx.author.id : ctx.user.id;
    const guildId = flow.guildId!;
    this.pending.delete(userId);
    this.cooldowns.set(`${guildId}:${userId}`, Date.now());

    // Acknowledge the button/select right away — creating the ticket (channel,
    // webhook, greeting DM) can take longer than Discord's 3s interaction window.
    if (!("author" in ctx) && !ctx.deferred && !ctx.replied) {
      await ctx.deferUpdate().catch(() => null);
    }

    try {
      const ticket = await this.tickets.createTicket({
        guildId,
        userId,
        openedById: userId,
        openedByStaff: false,
        reason: flow.message.content?.slice(0, 200) || null,
        categoryId: flow.categoryId ?? null,
        firstMessage: flow.message,
      });

      // away message
      const settings = await this.settings.get(guildId);
      if (settings && isOutsideWorkingHours(settings.config)) {
        const dm = await flow.message.author.createDM().catch(() => null);
        if (dm) {
          const payload = renderMessage(settings.config.awayMessage, {});
          if (payload.content || payload.embeds?.length) await dm.send(payload as never).catch(() => null);
        }
      }

      const confirmation = {
        content: "✅ Your ticket has been opened. Staff will reply here.",
        components: [],
        embeds: [],
      };
      if ("author" in ctx) await ctx.react("✅").catch(() => null);
      else await ctx.editReply(confirmation).catch(() => null);
      void ticket;
    } catch (err) {
      this.logger.error({ err }, "ticket creation failed");
      const msg = "Something went wrong opening your ticket. Please try again later.";
      if ("author" in ctx) await ctx.reply(msg).catch(() => null);
      else await ctx.editReply({ content: msg, components: [], embeds: [] }).catch(() => null);
    }
  }

  /** Sync user DM edits into their open ticket(s). */
  async handleEdit(message: Message): Promise<void> {
    if (message.channel.type !== ChannelType.DM) return;
    const open = await this.tickets.findOpenByUser(message.author.id);
    for (const t of open) await this.tickets.syncUserEdit(t, message).catch(() => null);
  }
}
