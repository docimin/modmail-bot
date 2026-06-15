import { createServerFn } from "@tanstack/react-start";
import { staffInputSchema } from "@modmail/core";
import { db, schema, and, eq, desc } from "#/server/db.ts";
import { requireGuildAccess, ForbiddenError } from "#/server/access.ts";

export const listStaff = createServerFn({ method: "GET" })
  .validator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return db.query.guildStaff.findMany({
      where: eq(schema.guildStaff.guildId, data.guildId),
      orderBy: desc(schema.guildStaff.createdAt),
    });
  });

export const addStaff = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; userId: string; role: "admin" | "staff" }) => d)
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new ForbiddenError();
    const parsed = staffInputSchema.parse({ userId: data.userId, role: data.role });
    await db
      .insert(schema.guildStaff)
      .values({
        guildId: data.guildId,
        userId: parsed.userId,
        role: parsed.role,
        addedById: access.discordUserId,
      })
      .onConflictDoUpdate({
        target: [schema.guildStaff.guildId, schema.guildStaff.userId],
        set: { role: parsed.role },
      });
    return { ok: true };
  });

export const removeStaff = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; userId: string }) => d)
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new ForbiddenError();
    await db
      .delete(schema.guildStaff)
      .where(
        and(
          eq(schema.guildStaff.guildId, data.guildId),
          eq(schema.guildStaff.userId, data.userId),
        ),
      );
    return { ok: true };
  });
