import { z } from "zod";

export const snowflake = z.string().regex(/^\d{15,20}$/, "Invalid Discord id");
export const guildRef = z.object({ guildId: snowflake });
export const idRef = guildRef.extend({ id: z.string().min(1).max(64) });
export const pagedRef = guildRef.extend({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});
