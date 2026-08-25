import { formatTicketName } from "@modmail/core";
import {
  ChannelType,
  type Client,
  type Guild,
  type GuildMember,
  PermissionFlagsBits,
  type TextChannel,
  ThreadAutoArchiveDuration,
  type Webhook,
} from "discord.js";
import type { ResolvedSettings } from "../settings/service.ts";

const WEBHOOK_NAME = "Modmail";
const webhookCache = new Map<string, Webhook>();

export interface CreatedInbox {
  /** thread id (threads mode) or channel id (channels mode) */
  channelId: string;
  /** text channel that owns the relay webhook */
  webhookChannelId: string;
  /** set when in threads mode */
  threadId: string | null;
}

/** Resolve or create a relay webhook on a text channel. */
export async function getWebhook(channel: TextChannel): Promise<Webhook> {
  const cached = webhookCache.get(channel.id);
  if (cached) return cached;

  const me = channel.client.user;
  const existing = await channel
    .fetchWebhooks()
    .then((hooks) => hooks.find((w) => w.owner?.id === me?.id))
    .catch(() => null);

  const webhook = existing ?? (await channel.createWebhook({ name: WEBHOOK_NAME }));
  webhookCache.set(channel.id, webhook);
  return webhook;
}

/**
 * Overwrites for a ticket channel. The bot must grant itself access explicitly:
 * denying @everyone also locks the bot out, and only the webhook relay would
 * still work, so the info embed and slash commands would fail silently.
 */
export function ticketOverwrites(input: {
  everyoneId: string;
  botId: string;
  staffRoleIds: string[];
  adminRoleIds: string[];
}) {
  const { everyoneId, botId, staffRoleIds, adminRoleIds } = input;
  const overwrites = [
    { id: everyoneId, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: botId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    },
  ];
  const seen = new Set([everyoneId, botId]);
  for (const id of [...staffRoleIds, ...adminRoleIds]) {
    if (seen.has(id)) continue;
    seen.add(id);
    overwrites.push({ id, allow: [PermissionFlagsBits.ViewChannel] });
  }
  return overwrites;
}

export async function createInbox(
  guild: Guild,
  settings: ResolvedSettings,
  opts: {
    member: GuildMember | null;
    userId: string;
    username: string;
    number: number;
    categoryOverrideId?: string | null;
  },
): Promise<CreatedInbox> {
  const name = formatTicketName(settings.config.nameFormat, {
    username: opts.username,
    userId: opts.userId,
    number: opts.number,
  });

  if (settings.mode === "threads") {
    const parentId = opts.categoryOverrideId ?? settings.inboxChannelId;
    if (!parentId) throw new Error("No inbox channel configured");
    const parent = await guild.channels.fetch(parentId).catch(() => null);
    if (!parent || parent.type !== ChannelType.GuildText)
      throw new Error("Inbox channel must be a text channel");

    const thread = await (parent as TextChannel).threads.create({
      name,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
      type: ChannelType.PrivateThread,
      invitable: false,
      reason: `Modmail ticket #${opts.number}`,
    });

    return {
      channelId: thread.id,
      webhookChannelId: parent.id,
      threadId: thread.id,
    };
  }

  // channels mode
  const categoryId =
    opts.categoryOverrideId ?? settings.fallbackCategoryId ?? settings.inboxChannelId;
  const channel = await guild.channels.create({
    name,
    type: ChannelType.GuildText,
    parent: categoryId ?? undefined,
    reason: `Modmail ticket #${opts.number}`,
    permissionOverwrites: ticketOverwrites({
      everyoneId: guild.id,
      botId: guild.members.me?.id ?? guild.client.user.id,
      staffRoleIds: settings.staffRoleIds,
      adminRoleIds: settings.adminRoleIds,
    }),
  });

  return {
    channelId: channel.id,
    webhookChannelId: channel.id,
    threadId: null,
  };
}

/** Returns the channel that owns the webhook for a ticket, plus thread id. */
export async function resolveRelay(
  client: Client,
  webhookChannelId: string,
): Promise<TextChannel | null> {
  const channel = await client.channels.fetch(webhookChannelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) return null;
  return channel;
}
