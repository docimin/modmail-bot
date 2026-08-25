import type { GuildConfig } from "@modmail/db";
import { z } from "zod";
import {
  DEFAULT_AWAY_MESSAGE,
  DEFAULT_BLOCKED_MESSAGE,
  DEFAULT_CLOSE_MESSAGE,
  DEFAULT_GREETING,
} from "./default-messages.ts";

const hexColor = z.string().regex(/^#?[0-9a-fA-F]{6}$/, "Must be a hex color like #5865f2");

export const embedFieldSchema = z.object({
  name: z.string().max(256),
  value: z.string().max(1024),
  inline: z.boolean().optional(),
});

export const embedSchema = z.object({
  title: z.string().max(256).optional(),
  description: z.string().max(4096).optional(),
  url: z.string().url().optional().or(z.literal("")),
  color: z.string().optional(),
  thumbnail: z.string().optional(),
  image: z.string().optional(),
  author: z
    .object({
      name: z.string().max(256).optional(),
      iconUrl: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  footer: z
    .object({
      text: z.string().max(2048).optional(),
      iconUrl: z.string().optional(),
    })
    .optional(),
  fields: z.array(embedFieldSchema).max(25).optional(),
  timestamp: z.boolean().optional(),
});

export const messageTemplateSchema = z.object({
  content: z.string().max(2000).optional(),
  embeds: z.array(embedSchema).max(10).optional(),
});

const workingHoursSchema = z.object({
  enabled: z.boolean().default(false),
  timezone: z.string().default("UTC"),
  days: z
    .array(
      z.object({
        day: z.number().int().min(0).max(6),
        open: z.string(),
        close: z.string(),
      }),
    )
    .default([]),
});

export const guildConfigSchema = z.object({
  // appearance
  accentColor: hexColor.default("#5865f2"),
  successColor: hexColor.default("#3ea45f"),
  errorColor: hexColor.default("#ed4245"),
  brandFooter: z.string().max(200).default(""),

  // ticket creation
  requireReason: z.boolean().default(false),
  confirmationEnabled: z.boolean().default(true),
  serverSelectEnabled: z.boolean().default(true),

  // greeting / lifecycle messages
  greetingEnabled: z.boolean().default(true),
  greetingMessage: messageTemplateSchema.default(DEFAULT_GREETING),
  closeMessageEnabled: z.boolean().default(true),
  closeMessage: messageTemplateSchema.default(DEFAULT_CLOSE_MESSAGE),
  blockedMessage: messageTemplateSchema.default(DEFAULT_BLOCKED_MESSAGE),
  awayEnabled: z.boolean().default(false),
  awayMessage: messageTemplateSchema.default(DEFAULT_AWAY_MESSAGE),
  receivedMessageEnabled: z.boolean().default(false),

  // relay behaviour
  anonymousByDefault: z.boolean().default(false),
  showStaffNames: z.boolean().default(true),
  showStaffRoles: z.boolean().default(false),
  attachmentsEnabled: z.boolean().default(true),
  dmReplyPrefixUser: z.string().default("**${user}:**\n${message}"),
  dmReplyPrefixStaff: z.string().default("**${staff} (Staff):**\n${message}"),
  dmReplyPrefixAnonymous: z.string().default("**Staff:**\n${message}"),

  // channel / thread naming
  nameFormat: z.string().default("{username}"),

  // automation
  autoCloseEnabled: z.boolean().default(false),
  autoCloseAfterMinutes: z.number().int().min(5).default(1440),
  autoCloseSilent: z.boolean().default(false),
  closeOnLeave: z.boolean().default(false),
  deleteChannelAfterCloseSeconds: z.number().int().min(0).default(10),

  // anti-spam / gating
  cooldownSeconds: z.number().int().min(0).default(0),
  maxOpenTicketsPerUser: z.number().int().min(1).default(1),
  minAccountAgeMinutes: z.number().int().min(0).default(0),
  minGuildAgeMinutes: z.number().int().min(0).default(0),

  // pings
  pingRoleIds: z.array(z.string()).default([]),
  pingOnNewTicket: z.boolean().default(false),
  pingOnNewMessage: z.boolean().default(false),

  // misc
  locale: z.string().default("en"),
  workingHours: workingHoursSchema.default({
    enabled: false,
    timezone: "UTC",
    days: [],
  }),
});

export type GuildConfigParsed = z.infer<typeof guildConfigSchema>;

// Compile-time guarantee the zod output matches the db jsonb type.
const _typecheck: GuildConfig = guildConfigSchema.parse({});
void _typecheck;

export const DEFAULT_GUILD_CONFIG: GuildConfig = guildConfigSchema.parse({});

/** Parse a raw config bag, filling defaults for any missing keys. */
export function parseGuildConfig(raw: unknown): GuildConfig {
  return guildConfigSchema.parse(raw ?? {});
}

/** Validate a partial update and merge it onto an existing config. */
export function mergeGuildConfig(current: GuildConfig, patch: unknown): GuildConfig {
  const partial = guildConfigSchema.partial().parse(patch ?? {});
  return guildConfigSchema.parse({ ...current, ...partial });
}
