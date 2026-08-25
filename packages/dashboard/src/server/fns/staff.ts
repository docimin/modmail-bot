import { staffInputSchema } from "@modmail/core";
import { createServerFn } from "@tanstack/react-start";
import { ForbiddenError, requireGuildAccess } from "#/server/access.ts";
import { and, db, desc, eq, schema } from "#/server/db.ts";
import { guildRef, snowflake } from "#/server/validators.ts";

export const listStaff = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return db.query.guildStaff.findMany({
      where: eq(schema.guildStaff.guildId, data.guildId),
      orderBy: desc(schema.guildStaff.createdAt),
    });
  });

export const addStaff = createServerFn({ method: "POST" })
  .validator((d: unknown) => guildRef.extend(staffInputSchema.shape).parse(d))
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new ForbiddenError();
    await db
      .insert(schema.guildStaff)
      .values({
        guildId: data.guildId,
        userId: data.userId,
        role: data.role,
        addedById: access.discordUserId,
      })
      .onConflictDoUpdate({
        target: [schema.guildStaff.guildId, schema.guildStaff.userId],
        set: { role: data.role },
      });
    return { ok: true };
  });

export const removeStaff = createServerFn({ method: "POST" })
  .validator((d: unknown) => guildRef.extend({ userId: snowflake }).parse(d))
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new ForbiddenError();
    await db
      .delete(schema.guildStaff)
      .where(
        and(eq(schema.guildStaff.guildId, data.guildId), eq(schema.guildStaff.userId, data.userId)),
      );
    return { ok: true };
  });
