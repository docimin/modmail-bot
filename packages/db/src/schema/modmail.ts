import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { MessageTemplate, JsonObject } from "../json-types.ts";
import { guilds } from "./guild.ts";
import {
  ticketStatus,
  ticketPriority,
  messageType,
  scheduledTaskType,
} from "./enums.ts";

const id = () => text("id").primaryKey().$defaultFn(() => nanoid());

// Ticket categories / departments. Optional routing + greeting per category.
export const ticketCategories = pgTable(
  "ticket_categories",
  {
    id: id(),
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    emoji: text("emoji"),
    color: text("color"),
    position: integer("position").notNull().default(0),
    staffRoleIds: jsonb("staff_role_ids").$type<string[]>().notNull().default([]),
    inboxChannelId: text("inbox_channel_id"), // override routing destination
    greetingMessage: jsonb("greeting_message").$type<MessageTemplate | null>(),
    enabled: boolean("enabled").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ticket_categories_guild_idx").on(t.guildId)],
);

// Ticket tags / labels.
export const tags = pgTable(
  "tags",
  {
    id: id(),
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color"),
    emoji: text("emoji"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tags_guild_name_idx").on(t.guildId, t.name)],
);

export const tickets = pgTable(
  "tickets",
  {
    id: id(),
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    number: integer("number").notNull(), // per-guild incrementing
    userId: text("user_id").notNull(), // the user the ticket is with
    openedById: text("opened_by_id").notNull(), // who opened it (user or staff)
    openedByStaff: boolean("opened_by_staff").notNull().default(false),
    channelId: text("channel_id"), // thread or channel id in the inbox
    dmChannelId: text("dm_channel_id"),
    infoMessageId: text("info_message_id"),
    status: ticketStatus("status").notNull().default("open"),
    priority: ticketPriority("priority").notNull().default("normal"),
    categoryId: text("category_id").references(() => ticketCategories.id, {
      onDelete: "set null",
    }),
    assignedStaffId: text("assigned_staff_id"),
    subject: text("subject"),
    reason: text("reason"),
    comment: text("comment"),
    closeReason: text("close_reason"),
    closedById: text("closed_by_id"),
    lastUserMessageAt: timestamp("last_user_message_at"),
    lastStaffMessageAt: timestamp("last_staff_message_at"),
    firstResponseAt: timestamp("first_response_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    closedAt: timestamp("closed_at"),
  },
  (t) => [
    index("tickets_guild_status_idx").on(t.guildId, t.status),
    index("tickets_guild_user_idx").on(t.guildId, t.userId),
    index("tickets_channel_idx").on(t.channelId),
    uniqueIndex("tickets_guild_number_idx").on(t.guildId, t.number),
  ],
);

export const ticketMessages = pgTable(
  "ticket_messages",
  {
    id: id(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    type: messageType("type").notNull(),
    authorId: text("author_id").notNull(),
    authorTag: text("author_tag"),
    authorAvatar: text("author_avatar"),
    content: text("content").notNull().default(""),
    anonymous: boolean("anonymous").notNull().default(false),
    attachments: jsonb("attachments")
      .$type<{ url: string; name: string; contentType?: string }[]>()
      .notNull()
      .default([]),
    dmMessageId: text("dm_message_id"),
    channelMessageId: text("channel_message_id"),
    edited: boolean("edited").notNull().default(false),
    deleted: boolean("deleted").notNull().default(false),
    snippetId: text("snippet_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ticket_messages_ticket_idx").on(t.ticketId, t.createdAt)],
);

// join table: tickets <-> tags
export const ticketTags = pgTable(
  "ticket_tags",
  {
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.ticketId, t.tagId] })],
);

// notify-on-new-message subscriptions
export const ticketSubscriptions = pgTable(
  "ticket_subscriptions",
  {
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.ticketId, t.userId] })],
);

export const snippets = pgTable(
  "snippets",
  {
    id: id(),
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    content: text("content").notNull(),
    createdById: text("created_by_id"),
    uses: integer("uses").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("snippets_guild_name_idx").on(t.guildId, t.name)],
);

export const blockedUsers = pgTable(
  "blocked_users",
  {
    id: id(),
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    reason: text("reason"),
    blockedById: text("blocked_by_id"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("blocked_users_guild_user_idx").on(t.guildId, t.userId)],
);

export const scheduledTasks = pgTable(
  "scheduled_tasks",
  {
    id: id(),
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    type: scheduledTaskType("type").notNull(),
    ticketId: text("ticket_id").references(() => tickets.id, {
      onDelete: "cascade",
    }),
    runAt: timestamp("run_at").notNull(),
    payload: jsonb("payload").$type<JsonObject>().notNull().default({}),
    createdById: text("created_by_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("scheduled_tasks_run_at_idx").on(t.runAt)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    actorId: text("actor_id").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    metadata: jsonb("metadata").$type<JsonObject>().notNull().default({}),
    source: text("source").notNull().default("bot"), // bot | dashboard
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("audit_log_guild_idx").on(t.guildId, t.createdAt)],
);

// ─── relations ──────────────────────────────────────────────────────────────

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  guild: one(guilds, { fields: [tickets.guildId], references: [guilds.id] }),
  category: one(ticketCategories, {
    fields: [tickets.categoryId],
    references: [ticketCategories.id],
  }),
  messages: many(ticketMessages),
  tags: many(ticketTags),
  subscriptions: many(ticketSubscriptions),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
}));

export const ticketTagsRelations = relations(ticketTags, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketTags.ticketId],
    references: [tickets.id],
  }),
  tag: one(tags, { fields: [ticketTags.tagId], references: [tags.id] }),
}));

export const ticketCategoriesRelations = relations(
  ticketCategories,
  ({ one, many }) => ({
    guild: one(guilds, {
      fields: [ticketCategories.guildId],
      references: [guilds.id],
    }),
    tickets: many(tickets),
  }),
);

export const tagsRelations = relations(tags, ({ one, many }) => ({
  guild: one(guilds, { fields: [tags.guildId], references: [guilds.id] }),
  tickets: many(ticketTags),
}));
