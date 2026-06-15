import { createServerFn } from "@tanstack/react-start";
import { snippetInputSchema } from "@modmail/core";
import { db, schema, and, eq, desc } from "#/server/db.ts";
import { requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";

export const listSnippets = createServerFn({ method: "GET" })
  .validator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return db.query.snippets.findMany({
      where: eq(schema.snippets.guildId, data.guildId),
      orderBy: desc(schema.snippets.createdAt),
    });
  });

export const saveSnippet = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; name: string; content: string }) => d)
  .handler(async ({ data }) => {
    const { userId } = await requireGuildAccess(data.guildId);
    const parsed = snippetInputSchema.parse({ name: data.name, content: data.content });
    const [row] = await db
      .insert(schema.snippets)
      .values({
        guildId: data.guildId,
        name: parsed.name,
        content: parsed.content,
        createdById: userId,
      })
      .onConflictDoUpdate({
        target: [schema.snippets.guildId, schema.snippets.name],
        set: { content: parsed.content, updatedAt: new Date() },
      })
      .returning();
    await botApi.invalidate(data.guildId);
    return row;
  });

export const deleteSnippet = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; id: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    await db
      .delete(schema.snippets)
      .where(and(eq(schema.snippets.guildId, data.guildId), eq(schema.snippets.id, data.id)));
    return { ok: true };
  });
