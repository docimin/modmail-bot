import { createServerFn } from "@tanstack/react-start";
import { db, schema, eq, desc, count } from "#/server/db.ts";
import { requireGuildAccess } from "#/server/access.ts";

export const listAudit = createServerFn({ method: "GET" })
  .validator((d: { guildId: string; page?: number; pageSize?: number }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);

    const pageSize = Math.min(data.pageSize ?? 50, 100);
    const page = Math.max(data.page ?? 1, 1);
    const where = eq(schema.auditLog.guildId, data.guildId);

    const items = await db.query.auditLog.findMany({
      where,
      orderBy: desc(schema.auditLog.createdAt),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    const totalRes = await db.select({ c: count() }).from(schema.auditLog).where(where);
    return { items, total: totalRes[0]?.c ?? 0, page, pageSize };
  });
