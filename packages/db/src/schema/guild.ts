import { relations } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import type { GuildConfig } from "../json-types.ts";
import { modmailMode, staffRole } from "./enums.ts";

// A Discord server the bot is (or was) in.
export const guilds = pgTable("guilds", {
  id: text("id").primaryKey(), // discord guild id
  name: text("name").notNull().default("Unknown"),
  icon: text("icon"),
  ownerId: text("owner_id"),
  memberCount: text("member_count"),
  botPresent: boolean("bot_present").notNull().default(true),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  leftAt: timestamp("left_at"),
});

// Per-guild modmail configuration. 1:1 with guilds.
export const guildSettings = pgTable("guild_settings", {
  guildId: text("guild_id")
    .primaryKey()
    .references(() => guilds.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").notNull().default(false),
  setupCompleted: boolean("setup_completed").notNull().default(false),
  mode: modmailMode("mode").notNull().default("threads"),
  inboxChannelId: text("inbox_channel_id"),
  logChannelId: text("log_channel_id"),
  transcriptChannelId: text("transcript_channel_id"),
  fallbackCategoryId: text("fallback_category_id"),
  staffRoleIds: jsonb("staff_role_ids").$type<string[]>().notNull().default([]),
  adminRoleIds: jsonb("admin_role_ids").$type<string[]>().notNull().default([]),
  config: jsonb("config").$type<GuildConfig>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Explicit dashboard access (in addition to Discord MANAGE_GUILD / staff roles).
export const guildStaff = pgTable(
  "guild_staff",
  {
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(), // discord user id
    role: staffRole("role").notNull().default("staff"),
    addedById: text("added_by_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.guildId, t.userId] }),
    index("guild_staff_user_idx").on(t.userId),
  ],
);

export const guildsRelations = relations(guilds, ({ one, many }) => ({
  settings: one(guildSettings, {
    fields: [guilds.id],
    references: [guildSettings.guildId],
  }),
  staff: many(guildStaff),
}));

export const guildSettingsRelations = relations(guildSettings, ({ one }) => ({
  guild: one(guilds, {
    fields: [guildSettings.guildId],
    references: [guilds.id],
  }),
}));
