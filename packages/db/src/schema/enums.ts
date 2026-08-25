import { pgEnum } from "drizzle-orm/pg-core";

export const modmailMode = pgEnum("modmail_mode", ["threads", "channels"]);
export const ticketStatus = pgEnum("ticket_status", ["open", "closed"]);
export const ticketPriority = pgEnum("ticket_priority", ["low", "normal", "high", "urgent"]);
export const messageType = pgEnum("message_type", [
  "user", // sent by the ticket user (DM -> inbox)
  "staff", // staff reply relayed to user
  "internal", // staff-only note (not relayed)
  "system", // bot system message
]);
export const staffRole = pgEnum("staff_role", ["admin", "staff"]);
export const scheduledTaskType = pgEnum("scheduled_task_type", [
  "close_ticket",
  "auto_close_check",
  "unblock_user",
  "reminder",
]);
