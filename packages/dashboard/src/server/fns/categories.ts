import { createServerFn } from "@tanstack/react-start";
import { categoryInputSchema } from "@modmail/core";
import { db, schema, and, eq, asc } from "#/server/db.ts";
import { requireGuildAccess, ForbiddenError } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";

export const listCategories = createServerFn({ method: "GET" })
  .validator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return db.query.ticketCategories.findMany({
      where: eq(schema.ticketCategories.guildId, data.guildId),
      orderBy: asc(schema.ticketCategories.position),
    });
  });

export const saveCategory = createServerFn({ method: "POST" })
  .validator(
    (d: {
      guildId: string;
      id?: string;
      name: string;
      description?: string;
      emoji?: string;
      color?: string;
      staffRoleIds?: string[];
      inboxChannelId?: string | null;
      enabled?: boolean;
    }) => d,
  )
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new ForbiddenError();

    const parsed = categoryInputSchema.parse({
      name: data.name,
      description: data.description,
      emoji: data.emoji,
      color: data.color,
      staffRoleIds: data.staffRoleIds,
      inboxChannelId: data.inboxChannelId,
      enabled: data.enabled,
    });

    if (data.id) {
      const [row] = await db
        .update(schema.ticketCategories)
        .set(parsed)
        .where(
          and(
            eq(schema.ticketCategories.id, data.id),
            eq(schema.ticketCategories.guildId, data.guildId),
          ),
        )
        .returning();
      await botApi.invalidate(data.guildId);
      return row ?? { ok: true };
    }

    const [row] = await db
      .insert(schema.ticketCategories)
      .values({ guildId: data.guildId, ...parsed })
      .returning();
    await botApi.invalidate(data.guildId);
    return row ?? { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; id: string }) => d)
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new ForbiddenError();
    await db
      .delete(schema.ticketCategories)
      .where(
        and(
          eq(schema.ticketCategories.id, data.id),
          eq(schema.ticketCategories.guildId, data.guildId),
        ),
      );
    await botApi.invalidate(data.guildId);
    return { ok: true };
  });
