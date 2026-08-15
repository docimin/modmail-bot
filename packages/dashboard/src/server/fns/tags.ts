import { tagInputSchema } from "@modmail/core";
import { createServerFn } from "@tanstack/react-start";
import { requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";
import { and, db, desc, eq, schema } from "#/server/db.ts";
import { guildRef, idRef } from "#/server/validators.ts";

export const listTags = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return db.query.tags.findMany({
      where: eq(schema.tags.guildId, data.guildId),
      orderBy: desc(schema.tags.createdAt),
    });
  });

export const createTag = createServerFn({ method: "POST" })
  .validator((d: unknown) => guildRef.extend(tagInputSchema.shape).parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    const parsed = tagInputSchema.parse({ name: data.name, color: data.color, emoji: data.emoji });
    const [row] = await db
      .insert(schema.tags)
      .values({
        guildId: data.guildId,
        name: parsed.name,
        color: parsed.color ?? null,
        emoji: parsed.emoji ?? null,
      })
      .returning();
    await botApi.invalidate(data.guildId);
    return row;
  });

export const deleteTag = createServerFn({ method: "POST" })
  .validator((d: unknown) => idRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    await db
      .delete(schema.tags)
      .where(and(eq(schema.tags.guildId, data.guildId), eq(schema.tags.id, data.id)));
    await botApi.invalidate(data.guildId);
    return { ok: true };
  });
