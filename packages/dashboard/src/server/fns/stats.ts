import { isNotNull } from "@modmail/db";
import { createServerFn } from "@tanstack/react-start";
import { requireGuildAccess } from "#/server/access.ts";
import { and, count, db, eq, gte, schema, sql } from "#/server/db.ts";
import { guildRef } from "#/server/validators.ts";

export const getStats = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);

    const guild = eq(schema.tickets.guildId, data.guildId);

    const openRes = await db
      .select({ c: count() })
      .from(schema.tickets)
      .where(and(guild, eq(schema.tickets.status, "open")));
    const closedRes = await db
      .select({ c: count() })
      .from(schema.tickets)
      .where(and(guild, eq(schema.tickets.status, "closed")));
    const totalRes = await db.select({ c: count() }).from(schema.tickets).where(guild);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayRes = await db
      .select({ c: count() })
      .from(schema.tickets)
      .where(and(guild, gte(schema.tickets.createdAt, startOfToday)));

    const blockedRes = await db
      .select({ c: count() })
      .from(schema.blockedUsers)
      .where(eq(schema.blockedUsers.guildId, data.guildId));
    const snippetsRes = await db
      .select({ c: count() })
      .from(schema.snippets)
      .where(eq(schema.snippets.guildId, data.guildId));

    const r = await db
      .select({
        v: sql<
          number | null
        >`avg(extract(epoch from (${schema.tickets.firstResponseAt} - ${schema.tickets.createdAt}))/60)`,
      })
      .from(schema.tickets)
      .where(and(guild, isNotNull(schema.tickets.firstResponseAt)));
    const avg = r[0]?.v ?? null;

    return {
      open: openRes[0]?.c ?? 0,
      closed: closedRes[0]?.c ?? 0,
      total: totalRes[0]?.c ?? 0,
      today: todayRes[0]?.c ?? 0,
      blocked: blockedRes[0]?.c ?? 0,
      snippets: snippetsRes[0]?.c ?? 0,
      avgFirstResponseMinutes: avg === null ? null : Math.round(avg),
    };
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);

    const guild = eq(schema.tickets.guildId, data.guildId);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const daily = await db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${schema.tickets.createdAt}), 'YYYY-MM-DD')`,
        c: count(),
      })
      .from(schema.tickets)
      .where(and(guild, gte(schema.tickets.createdAt, thirtyDaysAgo)))
      .groupBy(sql`1`)
      .orderBy(sql`1`);

    const byPriority = await db
      .select({ priority: schema.tickets.priority, c: count() })
      .from(schema.tickets)
      .where(guild)
      .groupBy(schema.tickets.priority);

    return { daily, byPriority };
  });
