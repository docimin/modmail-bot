import { closeInputSchema, noteInputSchema, PRIORITIES, replyInputSchema } from "@modmail/core";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";
import { and, count, db, desc, eq, ilike, inArray, or, schema } from "#/server/db.ts";

const guildId = z.string().regex(/^\d{15,20}$/, "Invalid guild id");
const ticketId = z.string().min(1).max(64);
const ticketRef = z.object({ guildId, ticketId });

const listSchema = z.object({
  guildId,
  status: z.enum(["open", "closed", "all"]).optional(),
  categoryId: z.string().max(64).optional(),
  assignedStaffId: z.string().max(32).optional(),
  priority: z.enum(PRIORITIES).optional(),
  search: z.string().max(200).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});

export const listTickets = createServerFn({ method: "GET" })
  .validator((d: unknown) => listSchema.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);

    const conds = [eq(schema.tickets.guildId, data.guildId)];
    if (data.status && data.status !== "all") conds.push(eq(schema.tickets.status, data.status));
    if (data.categoryId) conds.push(eq(schema.tickets.categoryId, data.categoryId));
    if (data.assignedStaffId) conds.push(eq(schema.tickets.assignedStaffId, data.assignedStaffId));
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

    const pageSize = data.pageSize ?? 25;
    const page = data.page ?? 1;

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
  .validator((d: unknown) => ticketRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    const ticket = await db.query.tickets.findFirst({
      where: and(eq(schema.tickets.id, data.ticketId), eq(schema.tickets.guildId, data.guildId)),
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
  .validator((d: unknown) => ticketRef.extend(replyInputSchema.shape).parse(d))
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    return (
      (await botApi.reply(data.guildId, data.ticketId, {
        content: data.content,
        anonymous: data.anonymous,
        snippetId: data.snippetId,
        actorId: access.discordUserId ?? "",
      })) ?? { ok: false, error: "Bot unreachable" }
    );
  });

export const closeTicket = createServerFn({ method: "POST" })
  .validator((d: unknown) => ticketRef.extend(closeInputSchema.shape).parse(d))
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    return (
      (await botApi.close(data.guildId, data.ticketId, {
        reason: data.reason,
        silent: data.silent,
        actorId: access.discordUserId ?? "",
      })) ?? { ok: false }
    );
  });

export const addNote = createServerFn({ method: "POST" })
  .validator((d: unknown) => ticketRef.extend(noteInputSchema.shape).parse(d))
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    return (
      (await botApi.note(data.guildId, data.ticketId, {
        content: data.content,
        actorId: access.discordUserId ?? "",
      })) ?? { ok: false }
    );
  });

export const assignTicket = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    ticketRef
      .extend({
        staffId: z
          .string()
          .regex(/^\d{15,20}$/)
          .nullish(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return (
      (await botApi.assign(data.guildId, data.ticketId, { staffId: data.staffId ?? null })) ?? {
        ok: false,
      }
    );
  });

export const setPriority = createServerFn({ method: "POST" })
  .validator((d: unknown) => ticketRef.extend({ priority: z.enum(PRIORITIES) }).parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return (
      (await botApi.priority(data.guildId, data.ticketId, { priority: data.priority })) ?? {
        ok: false,
      }
    );
  });

export const setTicketTags = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    ticketRef.extend({ tagIds: z.array(z.string().max(64)).max(50) }).parse(d),
  )
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);

    const ticket = await db.query.tickets.findFirst({
      columns: { id: true },
      where: and(eq(schema.tickets.id, data.ticketId), eq(schema.tickets.guildId, data.guildId)),
    });
    if (!ticket) return { ok: false };

    // only tags owned by this guild may be attached
    const owned = data.tagIds.length
      ? await db.query.tags.findMany({
          columns: { id: true },
          where: and(inArray(schema.tags.id, data.tagIds), eq(schema.tags.guildId, data.guildId)),
        })
      : [];

    await db.delete(schema.ticketTags).where(eq(schema.ticketTags.ticketId, ticket.id));
    if (owned.length)
      await db
        .insert(schema.ticketTags)
        .values(owned.map((t) => ({ ticketId: ticket.id, tagId: t.id })))
        .onConflictDoNothing();
    return { ok: true };
  });
