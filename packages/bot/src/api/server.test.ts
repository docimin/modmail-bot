import { expect, test } from "bun:test";
import type { Services } from "../framework.ts";
import { createApi } from "./server.ts";

const SECRET = "test-secret-value";

type FakeTicket = { id: string; guildId: string; status: string };

function fakeServices(ticket: FakeTicket | undefined) {
  const calls: string[] = [];
  const services = {
    client: {
      guilds: { fetch: () => Promise.resolve(null), cache: new Map() },
      isReady: () => true,
    },
    db: {
      query: { tickets: { findFirst: () => Promise.resolve(ticket) } },
      update: () => ({
        set: () => ({
          where: () => {
            calls.push("update");
            return Promise.resolve();
          },
        }),
      }),
    },
    logger: { info() {}, error() {} },
    settings: { invalidate: () => calls.push("invalidate") },
    tickets: {
      sendStaffReply: () => {
        calls.push("sendStaffReply");
        return Promise.resolve({ ok: true });
      },
      addInternalNote: () => {
        calls.push("addInternalNote");
        return Promise.resolve();
      },
      close: () => {
        calls.push("close");
        return Promise.resolve();
      },
    },
  } as unknown as Services;
  return { app: createApi(services, { secret: SECRET }), calls };
}

function req(path: string, body?: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${SECRET}`,
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body ?? {}),
  });
}

const ticketInB: FakeTicket = { id: "ticket-1", guildId: "guild-b", status: "open" };
const ticketInA: FakeTicket = { id: "ticket-1", guildId: "guild-a", status: "open" };

test("rejects a reply when the ticket belongs to another guild", async () => {
  const { app, calls } = fakeServices(ticketInB);

  const res = await app.fetch(
    req("/guilds/guild-a/tickets/ticket-1/reply", {
      content: "hello",
      anonymous: false,
      actorId: "1",
    }),
  );

  expect(res.status).toBe(404);
  expect(calls).not.toContain("sendStaffReply");
});

test("allows a reply when the ticket belongs to the requested guild", async () => {
  const { app, calls } = fakeServices(ticketInA);

  const res = await app.fetch(
    req("/guilds/guild-a/tickets/ticket-1/reply", {
      content: "hello",
      anonymous: false,
      actorId: "1",
    }),
  );

  expect(res.status).toBe(200);
  expect(calls).toContain("sendStaffReply");
});

test("scopes close, note, assign and priority to the requested guild", async () => {
  const { app, calls } = fakeServices(ticketInB);

  const cases: Array<[string, unknown]> = [
    ["/guilds/guild-a/tickets/ticket-1/close", { silent: false }],
    ["/guilds/guild-a/tickets/ticket-1/note", { content: "x", actorId: "1" }],
    ["/guilds/guild-a/tickets/ticket-1/assign", { staffId: "9" }],
    ["/guilds/guild-a/tickets/ticket-1/priority", { priority: "high" }],
  ];

  for (const [path, body] of cases) {
    const res = await app.fetch(req(path, body));
    expect(res.status).toBe(404);
  }
  expect(calls).toEqual([]);
});

test("returns 404 when the ticket does not exist at all", async () => {
  const { app } = fakeServices(undefined);

  const res = await app.fetch(
    req("/guilds/guild-a/tickets/nope/reply", { content: "x", anonymous: false, actorId: "1" }),
  );

  expect(res.status).toBe(404);
});

test("rejects a wrong secret of identical length", async () => {
  const { app } = fakeServices(ticketInA);
  const wrong = "x".repeat(SECRET.length);

  const res = await app.fetch(
    req(
      "/guilds/guild-a/tickets/ticket-1/reply",
      { content: "hi", anonymous: false, actorId: "1" },
      { authorization: `Bearer ${wrong}` },
    ),
  );

  expect(res.status).toBe(401);
});

test("rejects a secret of a different length", async () => {
  const { app } = fakeServices(ticketInA);

  const res = await app.fetch(
    req(
      "/guilds/guild-a/tickets/ticket-1/reply",
      { content: "hi", anonymous: false, actorId: "1" },
      { authorization: "Bearer short" },
    ),
  );

  expect(res.status).toBe(401);
});

test("rejects requests with no authorization header", async () => {
  const { app } = fakeServices(ticketInA);

  const res = await app.fetch(
    new Request("http://localhost/guilds/guild-a/tickets/ticket-1/reply", { method: "POST" }),
  );

  expect(res.status).toBe(401);
});

test("leaves /health open", async () => {
  const { app } = fakeServices(undefined);

  const res = await app.fetch(new Request("http://localhost/health"));

  expect(res.status).toBe(200);
});

test("rate limits repeated unauthorized attempts", async () => {
  const { app } = fakeServices(ticketInA);

  let last = 0;
  for (let i = 0; i < 130; i++) {
    const res = await app.fetch(
      req(
        "/guilds/guild-a/tickets/ticket-1/reply",
        { content: "hi", anonymous: false, actorId: "1" },
        { authorization: "Bearer wrong-secret-guess" },
      ),
    );
    last = res.status;
  }

  expect(last).toBe(429);
});
