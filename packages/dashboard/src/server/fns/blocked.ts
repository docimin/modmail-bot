import { blockInputSchema } from "@modmail/core";
import { createServerFn } from "@tanstack/react-start";
import { requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";
import { and, db, desc, eq, schema } from "#/server/db.ts";
import { guildRef, snowflake } from "#/server/validators.ts";

export const listBlocked = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return db.query.blockedUsers.findMany({
      where: eq(schema.blockedUsers.guildId, data.guildId),
      orderBy: desc(schema.blockedUsers.createdAt),
    });
  });

export const blockUser = createServerFn({ method: "POST" })
  .validator((d: unknown) => guildRef.extend(blockInputSchema.shape).parse(d))
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    const expiresAt = data.durationMinutes
      ? new Date(Date.now() + data.durationMinutes * 60000)
      : null;
    await db
      .insert(schema.blockedUsers)
      .values({
        guildId: data.guildId,
        userId: data.userId,
        reason: data.reason,
        blockedById: access.discordUserId,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [schema.blockedUsers.guildId, schema.blockedUsers.userId],
        set: { reason: data.reason, expiresAt, blockedById: access.discordUserId },
      });
    await botApi.invalidate(data.guildId);
    return { ok: true };
  });

export const unblockUser = createServerFn({ method: "POST" })
  .validator((d: unknown) => guildRef.extend({ userId: snowflake }).parse(d))
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
