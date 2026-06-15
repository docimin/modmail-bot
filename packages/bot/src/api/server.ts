import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { eq, schema } from "@modmail/db";
import {
  replyInputSchema,
  closeInputSchema,
  noteInputSchema,
  priorityInputSchema,
} from "@modmail/core";
import { env } from "../env.ts";
import type { Services } from "../framework.ts";
import {
  guildToDTO,
  channelsToDTO,
  rolesToDTO,
  emojisToDTO,
  memberToDTO,
  fetchMemberSafe,
} from "../lib/discord.ts";
import { deployCommands } from "../lib/deploy.ts";

export function startApi(services: Services): void {
  const app = new Hono();
  const { client, db, logger } = services;

  // bearer auth
  app.use("*", async (c, next) => {
    if (c.req.path === "/health") return next();
    const auth = c.req.header("authorization");
    if (auth !== `Bearer ${env.INTERNAL_API_SECRET}`)
      return c.json({ error: "unauthorized" }, 401);
    return next();
  });

  app.get("/health", (c) => c.json({ ok: true, ready: client.isReady() }));

  app.get("/guilds", (c) =>
    c.json([...client.guilds.cache.values()].map(guildToDTO)),
  );

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

  async function getTicket(id: string) {
    return db.query.tickets.findFirst({ where: eq(schema.tickets.id, id) });
  }

  app.post("/tickets/:id/reply", async (c) => {
    const ticket = await getTicket(c.req.param("id"));
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

  app.post("/tickets/:id/note", async (c) => {
    const ticket = await getTicket(c.req.param("id"));
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

  app.post("/tickets/:id/close", async (c) => {
    const ticket = await getTicket(c.req.param("id"));
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

  app.post("/tickets/:id/assign", async (c) => {
    const ticket = await getTicket(c.req.param("id"));
    if (!ticket) return c.json({ error: "not_found" }, 404);
    const body = await c.req.json().catch(() => ({}));
    const staffId = body.staffId ? String(body.staffId) : null;
    await db
      .update(schema.tickets)
      .set({ assignedStaffId: staffId })
      .where(eq(schema.tickets.id, ticket.id));
    return c.json({ ok: true });
  });

  app.post("/tickets/:id/priority", async (c) => {
    const ticket = await getTicket(c.req.param("id"));
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

  serve({ fetch: app.fetch, port: env.INTERNAL_API_PORT }, (info) => {
    logger.info(`Internal API listening on :${info.port}`);
  });
}
