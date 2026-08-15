import { createServerFn } from "@tanstack/react-start";
import { requireGuildAccess } from "#/server/access.ts";
import { count, db, desc, eq, schema } from "#/server/db.ts";
import { pagedRef } from "#/server/validators.ts";

export const listAudit = createServerFn({ method: "GET" })
  .validator((d: unknown) => pagedRef.parse(d))
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
