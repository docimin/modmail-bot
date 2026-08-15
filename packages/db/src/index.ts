import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import * as schema from "./schema/index.ts";

// drizzle helpers re-exported so consumers don't depend on drizzle-orm directly
export {
  and,
  asc,
  avg,
  count,
  countDistinct,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  max,
  min,
  not,
  notInArray,
  or,
  sql,
  sum,
} from "drizzle-orm";
export * from "./client.ts";
export type * from "./json-types.ts";
export * from "./schema/index.ts";
export { schema };

// Inferred row types
export type Guild = InferSelectModel<typeof schema.guilds>;
export type GuildSettings = InferSelectModel<typeof schema.guildSettings>;
export type GuildSettingsInsert = InferInsertModel<typeof schema.guildSettings>;
export type GuildStaff = InferSelectModel<typeof schema.guildStaff>;
export type Ticket = InferSelectModel<typeof schema.tickets>;
export type TicketInsert = InferInsertModel<typeof schema.tickets>;
export type TicketMessage = InferSelectModel<typeof schema.ticketMessages>;
export type TicketMessageInsert = InferInsertModel<typeof schema.ticketMessages>;
export type TicketCategory = InferSelectModel<typeof schema.ticketCategories>;
export type Tag = InferSelectModel<typeof schema.tags>;
export type Snippet = InferSelectModel<typeof schema.snippets>;
export type BlockedUser = InferSelectModel<typeof schema.blockedUsers>;
export type ScheduledTask = InferSelectModel<typeof schema.scheduledTasks>;
export type AuditLogEntry = InferSelectModel<typeof schema.auditLog>;
export type User = InferSelectModel<typeof schema.user>;
export type Account = InferSelectModel<typeof schema.account>;
export type Session = InferSelectModel<typeof schema.session>;
