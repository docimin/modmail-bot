import {
  mergeGuildConfig,
  missingToEnable,
  parseGuildConfig,
  settingsUpdateSchema,
} from "@modmail/core";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";
import { db, eq, schema } from "#/server/db.ts";
import { SetupIncompleteError } from "#/server/errors.ts";
import { guildRef } from "#/server/validators.ts";

export const updateSettings = createServerFn({ method: "POST" })
  .validator((d: unknown) => guildRef.extend({ update: settingsUpdateSchema }).parse(d))
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new Error("FORBIDDEN");

    const parsed = data.update;
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
    if (parsed.fallbackCategoryId !== undefined) set.fallbackCategoryId = parsed.fallbackCategoryId;
    if (parsed.staffRoleIds !== undefined) set.staffRoleIds = parsed.staffRoleIds;
    if (parsed.adminRoleIds !== undefined) set.adminRoleIds = parsed.adminRoleIds;
    if (parsed.config) set.config = mergeGuildConfig(parseGuildConfig(row?.config), parsed.config);
    set.updatedAt = new Date();

    const effectiveInbox =
      parsed.inboxChannelId !== undefined ? parsed.inboxChannelId : row?.inboxChannelId;
    const effectiveEnabled = parsed.enabled !== undefined ? parsed.enabled : row?.enabled;
    const effectiveMode = parsed.mode ?? row?.mode ?? "threads";
    const effectiveCategory =
      parsed.fallbackCategoryId !== undefined ? parsed.fallbackCategoryId : row?.fallbackCategoryId;

    // Enabling with pieces missing leaves the server silently absent from the
    // DM picker, so refuse it and name what is outstanding.
    const missing = missingToEnable({
      mode: effectiveMode,
      inboxChannelId: effectiveInbox,
      fallbackCategoryId: effectiveCategory,
    });
    if (effectiveEnabled && missing.length) throw new SetupIncompleteError(missing);

    set.setupCompleted = !!(effectiveEnabled && !missing.length);

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
  .validator((d: unknown) => guildRef.extend({ enabled: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new Error("FORBIDDEN");

    if (data.enabled) {
      const row = await db.query.guildSettings.findFirst({
        where: eq(schema.guildSettings.guildId, data.guildId),
      });
      const missing = missingToEnable({
        mode: row?.mode ?? "threads",
        inboxChannelId: row?.inboxChannelId,
        fallbackCategoryId: row?.fallbackCategoryId,
      });
      if (missing.length) throw new SetupIncompleteError(missing);
    }

    await db
      .update(schema.guildSettings)
      .set({ enabled: data.enabled, setupCompleted: data.enabled, updatedAt: new Date() })
      .where(eq(schema.guildSettings.guildId, data.guildId));

    await botApi.invalidate(data.guildId);
    return { ok: true };
  });
