import { snippetInputSchema } from "@modmail/core";
import { createServerFn } from "@tanstack/react-start";
import { requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";
import { and, db, desc, eq, schema } from "#/server/db.ts";
import { guildRef, idRef } from "#/server/validators.ts";

export const listSnippets = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return db.query.snippets.findMany({
      where: eq(schema.snippets.guildId, data.guildId),
      orderBy: desc(schema.snippets.createdAt),
    });
  });

export const saveSnippet = createServerFn({ method: "POST" })
  .validator((d: unknown) => guildRef.extend(snippetInputSchema.shape).parse(d))
  .handler(async ({ data }) => {
    const { userId } = await requireGuildAccess(data.guildId);
    const [row] = await db
      .insert(schema.snippets)
      .values({
        guildId: data.guildId,
        name: data.name,
        content: data.content,
        createdById: userId,
      })
      .onConflictDoUpdate({
        target: [schema.snippets.guildId, schema.snippets.name],
        set: { content: data.content, updatedAt: new Date() },
      })
      .returning();
    await botApi.invalidate(data.guildId);
    return row;
  });

export const deleteSnippet = createServerFn({ method: "POST" })
  .validator((d: unknown) => idRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    await db
      .delete(schema.snippets)
      .where(and(eq(schema.snippets.guildId, data.guildId), eq(schema.snippets.id, data.id)));
    return { ok: true };
  });
