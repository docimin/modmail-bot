import { createServerFn } from "@tanstack/react-start";
import { blockInputSchema } from "@modmail/core";
import { db, schema, and, eq, desc } from "#/server/db.ts";
import { requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";

export const listBlocked = createServerFn({ method: "GET" })
  .validator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return db.query.blockedUsers.findMany({
      where: eq(schema.blockedUsers.guildId, data.guildId),
      orderBy: desc(schema.blockedUsers.createdAt),
    });
  });

export const blockUser = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; userId: string; reason?: string; durationMinutes?: number }) => d)
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    const parsed = blockInputSchema.parse({
      userId: data.userId,
      reason: data.reason,
      durationMinutes: data.durationMinutes,
    });
    const expiresAt = parsed.durationMinutes
      ? new Date(Date.now() + parsed.durationMinutes * 60000)
      : null;
    await db
      .insert(schema.blockedUsers)
      .values({
        guildId: data.guildId,
        userId: parsed.userId,
        reason: parsed.reason,
        blockedById: access.discordUserId,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [schema.blockedUsers.guildId, schema.blockedUsers.userId],
        set: { reason: parsed.reason, expiresAt, blockedById: access.discordUserId },
      });
    await botApi.invalidate(data.guildId);
    return { ok: true };
  });

export const unblockUser = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; userId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    await db
      .delete(schema.blockedUsers)
      .where(
        and(
          eq(schema.blockedUsers.guildId, data.guildId),
          eq(schema.blockedUsers.userId, data.userId),
        ),
      );
    await botApi.invalidate(data.guildId);
    return { ok: true };
  });
