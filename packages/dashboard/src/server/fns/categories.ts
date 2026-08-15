import { categoryInputSchema } from "@modmail/core";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ForbiddenError, requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";
import { and, asc, db, eq, schema } from "#/server/db.ts";
import { guildRef, idRef } from "#/server/validators.ts";

export const listCategories = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return db.query.ticketCategories.findMany({
      where: eq(schema.ticketCategories.guildId, data.guildId),
      orderBy: asc(schema.ticketCategories.position),
    });
  });

export const saveCategory = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    guildRef
      .extend({ id: z.string().min(1).max(64).optional() })
      .extend(categoryInputSchema.shape)
      .parse(d),
  )
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    if (access.role !== "admin") throw new ForbiddenError();

    const { guildId, id, ...values } = data;

    if (id) {
      const [row] = await db
        .update(schema.ticketCategories)
        .set(values)
        .where(
          and(eq(schema.ticketCategories.id, id), eq(schema.ticketCategories.guildId, guildId)),
        )
        .returning();
      await botApi.invalidate(guildId);
      return row ?? { ok: true };
    }

    const [row] = await db
      .insert(schema.ticketCategories)
      .values({ guildId, ...values })
      .returning();
    await botApi.invalidate(guildId);
    return row ?? { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator((d: unknown) => idRef.parse(d))
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
