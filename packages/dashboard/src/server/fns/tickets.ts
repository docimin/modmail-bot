import { createServerFn } from "@tanstack/react-start";
import type { Priority } from "@modmail/core";
import { db, schema, and, eq, or, desc, ilike, count } from "#/server/db.ts";
import { requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";

type StatusFilter = "open" | "closed" | "all";

export const listTickets = createServerFn({ method: "GET" })
  .validator(
    (d: {
      guildId: string;
      status?: StatusFilter;
      categoryId?: string;
      assignedStaffId?: string;
      priority?: Priority;
      search?: string;
      page?: number;
      pageSize?: number;
    }) => d,
  )
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);

    const conds = [eq(schema.tickets.guildId, data.guildId)];
    if (data.status && data.status !== "all")
      conds.push(eq(schema.tickets.status, data.status));
    if (data.categoryId) conds.push(eq(schema.tickets.categoryId, data.categoryId));
    if (data.assignedStaffId)
      conds.push(eq(schema.tickets.assignedStaffId, data.assignedStaffId));
    if (data.priority) conds.push(eq(schema.tickets.priority, data.priority));
    if (data.search) {
      const term = `%${data.search}%`;
      const search = or(
        ilike(schema.tickets.userId, term),
        ilike(schema.tickets.reason, term),
        ilike(schema.tickets.subject, term),
      );
      if (search) conds.push(search);
    }
    const where = and(...conds);

    const pageSize = Math.min(Math.max(data.pageSize ?? 25, 1), 100);
    const page = Math.max(data.page ?? 1, 1);

    const items = await db.query.tickets.findMany({
      where,
      orderBy: desc(schema.tickets.createdAt),
      limit: pageSize,
      offset: (page - 1) * pageSize,
      with: { category: true, tags: { with: { tag: true } } },
    });
    const totalRes = await db.select({ c: count() }).from(schema.tickets).where(where);
    return { items, total: totalRes[0]?.c ?? 0, page, pageSize };
  });

export const getTicket = createServerFn({ method: "GET" })
  .validator((d: { guildId: string; ticketId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    const ticket = await db.query.tickets.findFirst({
      where: and(
        eq(schema.tickets.id, data.ticketId),
        eq(schema.tickets.guildId, data.guildId),
      ),
      with: {
        category: true,
        tags: { with: { tag: true } },
        messages: { orderBy: (m, { asc }) => asc(m.createdAt) },
      },
    });
    if (!ticket) return null;
    const member = await botApi.member(data.guildId, ticket.userId);
    return { ticket, member };
  });

export const replyTicket = createServerFn({ method: "POST" })
  .validator(
    (d: { guildId: string; ticketId: string; content: string; anonymous: boolean; snippetId?: string }) => d,
  )
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    return (
      (await botApi.reply(data.ticketId, {
        content: data.content,
        anonymous: data.anonymous,
        snippetId: data.snippetId,
        actorId: access.discordUserId ?? "",
      })) ?? { ok: false, error: "Bot unreachable" }
    );
  });

export const closeTicket = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; ticketId: string; reason?: string; silent?: boolean }) => d)
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    return (
      (await botApi.close(data.ticketId, {
        reason: data.reason,
        silent: data.silent ?? false,
        actorId: access.discordUserId ?? "",
      })) ?? { ok: false }
    );
  });

export const addNote = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; ticketId: string; content: string }) => d)
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    return (
      (await botApi.note(data.ticketId, {
        content: data.content,
        actorId: access.discordUserId ?? "",
      })) ?? { ok: false }
    );
  });

export const assignTicket = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; ticketId: string; staffId?: string | null }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return (await botApi.assign(data.ticketId, { staffId: data.staffId ?? null })) ?? { ok: false };
  });

export const setPriority = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; ticketId: string; priority: Priority }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return (await botApi.priority(data.ticketId, { priority: data.priority })) ?? { ok: false };
  });

export const setTicketTags = createServerFn({ method: "POST" })
  .validator((d: { guildId: string; ticketId: string; tagIds: string[] }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    await db.delete(schema.ticketTags).where(eq(schema.ticketTags.ticketId, data.ticketId));
    if (data.tagIds.length)
      await db
        .insert(schema.ticketTags)
        .values(data.tagIds.map((tagId) => ({ ticketId: data.ticketId, tagId })))
        .onConflictDoNothing();
    return { ok: true };
  });
