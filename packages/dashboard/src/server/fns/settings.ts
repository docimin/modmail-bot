import { createServerFn } from "@tanstack/react-start";
import { settingsUpdateSchema, parseGuildConfig, mergeGuildConfig } from "@modmail/core";
import { db, schema, eq } from "#/server/db.ts";
import { requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";

export const updateSettings = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; update: unknown }) => d)
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new Error("FORBIDDEN");

    const parsed = settingsUpdateSchema.parse(data.update);
    const row = await db.query.guildSettings.findFirst({
      where: eq(schema.guildSettings.guildId, data.guildId),
    });

    const set: Record<string, unknown> = {};
    if (parsed.enabled !== undefined) set.enabled = parsed.enabled;
    if (parsed.mode !== undefined) set.mode = parsed.mode;
    if (parsed.inboxChannelId !== undefined) set.inboxChannelId = parsed.inboxChannelId;
    if (parsed.logChannelId !== undefined) set.logChannelId = parsed.logChannelId;
    if (parsed.transcriptChannelId !== undefined)
      set.transcriptChannelId = parsed.transcriptChannelId;
    if (parsed.fallbackCategoryId !== undefined)
      set.fallbackCategoryId = parsed.fallbackCategoryId;
    if (parsed.staffRoleIds !== undefined) set.staffRoleIds = parsed.staffRoleIds;
    if (parsed.adminRoleIds !== undefined) set.adminRoleIds = parsed.adminRoleIds;
    if (parsed.config) set.config = mergeGuildConfig(parseGuildConfig(row?.config), parsed.config);
    set.updatedAt = new Date();

    // "set up" == enabled with an inbox channel configured
    const effectiveInbox =
      parsed.inboxChannelId !== undefined ? parsed.inboxChannelId : row?.inboxChannelId;
    const effectiveEnabled =
      parsed.enabled !== undefined ? parsed.enabled : row?.enabled;
    set.setupCompleted = !!(effectiveEnabled && effectiveInbox);

    if (row) {
      await db
        .update(schema.guildSettings)
        .set(set)
        .where(eq(schema.guildSettings.guildId, data.guildId));
    } else {
      await db.insert(schema.guildSettings).values({
        guildId: data.guildId,
        config: parseGuildConfig(parsed.config ?? {}),
        ...set,
      });
    }

    await botApi.invalidate(data.guildId);
    return { ok: true };
  });

export const setEnabled = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; enabled: boolean }) => d)
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new Error("FORBIDDEN");

    await db
      .update(schema.guildSettings)
      .set({ enabled: data.enabled, updatedAt: new Date() })
      .where(eq(schema.guildSettings.guildId, data.guildId));

    await botApi.invalidate(data.guildId);
    return { ok: true };
  });
