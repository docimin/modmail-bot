import { timingSafeEqual } from "node:crypto";
import { serve } from "@hono/node-server";
import {
  closeInputSchema,
  noteInputSchema,
  priorityInputSchema,
  replyInputSchema,
} from "@modmail/core";
import { eq, schema } from "@modmail/db";
import { Hono } from "hono";
import { env } from "../env.ts";
import type { Services } from "../framework.ts";
import { deployCommands } from "../lib/deploy.ts";
import {
  channelsToDTO,
  emojisToDTO,
  fetchMemberSafe,
  guildToDTO,
  memberToDTO,
  rolesToDTO,
} from "../lib/discord.ts";

const AUTH_WINDOW_MS = 60_000;
const MAX_AUTH_FAILURES = 100;

function secretMatches(header: string | undefined, secret: string): boolean {
  if (!header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);
  // length must match before timingSafeEqual, which throws on differing sizes
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export function createApi(services: Services, opts: { secret: string }): Hono {
  const app = new Hono();
  const { client, db } = services;

  // Throttle failed auth only: a shared budget would let an attacker starve the dashboard.
  let windowStart = Date.now();
  let failures = 0;

  app.use("*", async (c, next) => {
    if (c.req.path === "/health") return next();

    if (secretMatches(c.req.header("authorization"), opts.secret)) return next();

    const now = Date.now();
    if (now - windowStart > AUTH_WINDOW_MS) {
      windowStart = now;
      failures = 0;
    }
    failures++;
    if (failures > MAX_AUTH_FAILURES) return c.json({ error: "too_many_requests" }, 429);
    return c.json({ error: "unauthorized" }, 401);
  });

  app.get("/health", (c) => c.json({ ok: true, ready: client.isReady() }));

  app.get("/guilds", (c) => c.json([...client.guilds.cache.values()].map(guildToDTO)));

  app.get("/guilds/:id", async (c) => {
    const guild = await client.guilds.fetch(c.req.param("id")).catch(() => null);
    if (!guild) return c.json({ error: "not_found" }, 404);
    return c.json(guildToDTO(guild));
  });

  app.get("/guilds/:id/channels", async (c) => {
    const guild = await client.guilds.fetch(c.req.param("id")).catch(() => null);
    if (!guild) return c.json({ error: "not_found" }, 404);
    return c.json(channelsToDTO(guild));
  });

  app.get("/guilds/:id/roles", async (c) => {
    const guild = await client.guilds.fetch(c.req.param("id")).catch(() => null);
    if (!guild) return c.json({ error: "not_found" }, 404);
    return c.json(rolesToDTO(guild));
  });

  app.get("/guilds/:id/emojis", async (c) => {
    const guild = await client.guilds.fetch(c.req.param("id")).catch(() => null);
    if (!guild) return c.json({ error: "not_found" }, 404);
    return c.json(emojisToDTO(guild));
  });

  app.get("/guilds/:id/members/:userId", async (c) => {
    const guild = await client.guilds.fetch(c.req.param("id")).catch(() => null);
    if (!guild) return c.json({ error: "not_found" }, 404);
    const member = await fetchMemberSafe(guild, c.req.param("userId"));
    if (!member) return c.json({ error: "not_found" }, 404);
    return c.json(memberToDTO(member));
  });

  app.post("/guilds/:id/invalidate", (c) => {
    services.settings.invalidate(c.req.param("id"));
    return c.json({ ok: true });
  });

  // ─── ticket actions ──────────────────────────────────────────────────────

  /** Tickets are only ever addressable through the guild that owns them. */
  async function getTicket(c: { req: { param(k: string): string } }) {
    const ticket = await db.query.tickets.findFirst({
      where: eq(schema.tickets.id, c.req.param("ticketId")),
    });
    if (!ticket || ticket.guildId !== c.req.param("guildId")) return null;
    return ticket;
  }

  app.post("/guilds/:guildId/tickets/:ticketId/reply", async (c) => {
    const ticket = await getTicket(c);
    if (!ticket) return c.json({ error: "not_found" }, 404);
    const body = await c.req.json().catch(() => ({}));
    const parsed = replyInputSchema.safeParse(body);
    if (!parsed.success) return c.json({ ok: false, error: "invalid" }, 400);
    const actorId = String(body.actorId ?? "");

    const guild = await client.guilds.fetch(ticket.guildId).catch(() => null);
    const member = guild ? await fetchMemberSafe(guild, actorId) : null;

    const result = await services.tickets.sendStaffReply(ticket, {
      authorId: actorId,
      authorTag: member?.user.username ?? "Staff",
      authorAvatar: member?.displayAvatarURL() ?? "",
      content: parsed.data.content,
      anonymous: parsed.data.anonymous,
      snippetId: parsed.data.snippetId ?? null,
    });
    return c.json(result, result.ok ? 200 : 409);
  });

  app.post("/guilds/:guildId/tickets/:ticketId/note", async (c) => {
    const ticket = await getTicket(c);
    if (!ticket) return c.json({ error: "not_found" }, 404);
    const body = await c.req.json().catch(() => ({}));
    const parsed = noteInputSchema.safeParse(body);
    if (!parsed.success) return c.json({ ok: false, error: "invalid" }, 400);
    const actorId = String(body.actorId ?? "");
    const guild = await client.guilds.fetch(ticket.guildId).catch(() => null);
    const member = guild ? await fetchMemberSafe(guild, actorId) : null;
    await services.tickets.addInternalNote(ticket, {
      authorId: actorId,
      authorTag: member?.user.username ?? "Staff",
      authorAvatar: member?.displayAvatarURL() ?? "",
      content: parsed.data.content,
    });
    return c.json({ ok: true });
  });

  app.post("/guilds/:guildId/tickets/:ticketId/close", async (c) => {
    const ticket = await getTicket(c);
    if (!ticket) return c.json({ error: "not_found" }, 404);
    const body = await c.req.json().catch(() => ({}));
    const parsed = closeInputSchema.safeParse(body);
    if (!parsed.success) return c.json({ ok: false, error: "invalid" }, 400);
    const actorId = String(body.actorId ?? "");
    if (ticket.status === "closed") return c.json({ ok: true });
    await services.tickets.close(ticket, {
      byId: actorId,
      reason: parsed.data.reason ?? null,
      silent: parsed.data.silent,
    });
    return c.json({ ok: true });
  });

  app.post("/guilds/:guildId/tickets/:ticketId/assign", async (c) => {
    const ticket = await getTicket(c);
    if (!ticket) return c.json({ error: "not_found" }, 404);
    const body = await c.req.json().catch(() => ({}));
    const staffId = body.staffId ? String(body.staffId) : null;
    await db
      .update(schema.tickets)
      .set({ assignedStaffId: staffId })
      .where(eq(schema.tickets.id, ticket.id));
    return c.json({ ok: true });
  });

  app.post("/guilds/:guildId/tickets/:ticketId/priority", async (c) => {
    const ticket = await getTicket(c);
    if (!ticket) return c.json({ error: "not_found" }, 404);
    const body = await c.req.json().catch(() => ({}));
    const parsed = priorityInputSchema.safeParse(body);
    if (!parsed.success) return c.json({ ok: false, error: "invalid" }, 400);
    await db
      .update(schema.tickets)
      .set({ priority: parsed.data.priority })
      .where(eq(schema.tickets.id, ticket.id));
    return c.json({ ok: true });
  });

  app.post("/commands/refresh", async (c) => {
    const count = await deployCommands(services.commands, {
      token: env.DISCORD_BOT_TOKEN,
      clientId: env.DISCORD_CLIENT_ID,
    });
    return c.json({ ok: true, count });
  });

  return app;
}

export function startApi(services: Services): void {
  const app = createApi(services, { secret: env.INTERNAL_API_SECRET });
  serve(
    {
      fetch: app.fetch,
      port: env.INTERNAL_API_PORT,
      hostname: env.INTERNAL_API_HOST,
    },
    (info) => {
      services.logger.info(`Internal API listening on ${env.INTERNAL_API_HOST}:${info.port}`);
    },
  );
}
