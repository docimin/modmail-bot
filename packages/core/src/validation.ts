import { z } from "zod";
import { LIMITS, PRIORITIES } from "./constants.ts";
import { guildConfigSchema } from "./settings.ts";

const snowflake = z.string().regex(/^\d{15,20}$/, "Invalid Discord ID");

export const snippetInputSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(LIMITS.snippetName)
    .regex(/^[\w-]+$/, "Use letters, numbers, _ and - only"),
  content: z.string().min(1).max(LIMITS.snippetContent),
});
export type SnippetInput = z.infer<typeof snippetInputSchema>;

export const blockInputSchema = z.object({
  userId: snowflake,
  reason: z.string().max(LIMITS.reason).optional(),
  durationMinutes: z.number().int().min(0).optional(),
});
export type BlockInput = z.infer<typeof blockInputSchema>;

export const categoryInputSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(200).optional(),
  emoji: z.string().max(64).optional(),
  color: z.string().optional(),
  staffRoleIds: z.array(snowflake).default([]),
  inboxChannelId: snowflake.nullish(),
  enabled: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const tagInputSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional(),
  emoji: z.string().max(64).optional(),
});
export type TagInput = z.infer<typeof tagInputSchema>;

export const replyInputSchema = z.object({
  content: z.string().min(1).max(LIMITS.content),
  anonymous: z.boolean().default(false),
  snippetId: z.string().optional(),
});
export type ReplyInput = z.infer<typeof replyInputSchema>;

export const noteInputSchema = z.object({
  content: z.string().min(1).max(LIMITS.content),
});
export type NoteInput = z.infer<typeof noteInputSchema>;

export const closeInputSchema = z.object({
  reason: z.string().max(LIMITS.reason).optional(),
  delayMinutes: z.number().int().min(0).optional(),
  silent: z.boolean().default(false),
});
export type CloseInput = z.infer<typeof closeInputSchema>;

export const priorityInputSchema = z.object({
  priority: z.enum(PRIORITIES),
});

export const settingsUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  mode: z.enum(["threads", "channels"]).optional(),
  inboxChannelId: snowflake.nullish(),
  logChannelId: snowflake.nullish(),
  transcriptChannelId: snowflake.nullish(),
  fallbackCategoryId: snowflake.nullish(),
  staffRoleIds: z.array(snowflake).optional(),
  adminRoleIds: z.array(snowflake).optional(),
  config: guildConfigSchema.partial().optional(),
});
export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>;

export const staffInputSchema = z.object({
  userId: snowflake,
  role: z.enum(["admin", "staff"]).default("staff"),
});
export type StaffInput = z.infer<typeof staffInputSchema>;
