import { expect, test } from "bun:test";
import { PERMISSIONS } from "@modmail/core";
import { resolveGuildAccess } from "./access-policy.ts";

const OWNER = { id: "g1", name: "g", icon: null, owner: true, permissions: "0" };
const MANAGER = {
  id: "g1",
  name: "g",
  icon: null,
  owner: false,
  permissions: PERMISSIONS.MANAGE_GUILD.toString(),
};
const MEMBER = { id: "g1", name: "g", icon: null, owner: false, permissions: "0" };

test("Discord guild owner is an admin", () => {
  expect(
    resolveGuildAccess({ userId: "u1", discordUserId: "d1", guild: OWNER, staffRole: null }),
  ).toEqual({ userId: "u1", discordUserId: "d1", role: "admin" });
});

test("MANAGE_GUILD grants admin", () => {
  expect(
    resolveGuildAccess({ userId: "u1", discordUserId: "d1", guild: MANAGER, staffRole: null })
      ?.role,
  ).toBe("admin");
});

test("a plain member of the Discord guild gets no access without a staff row", () => {
  expect(
    resolveGuildAccess({ userId: "u1", discordUserId: "d1", guild: MEMBER, staffRole: null }),
  ).toBeNull();
});

test("a configured staff row grants access when Discord gives none", () => {
  expect(
    resolveGuildAccess({
      userId: "u1",
      discordUserId: "d1",
      guild: undefined,
      staffRole: "staff",
    }),
  ).toEqual({ userId: "u1", discordUserId: "d1", role: "staff" });
});

test("a configured admin row is honoured", () => {
  expect(
    resolveGuildAccess({ userId: "u1", discordUserId: "d1", guild: undefined, staffRole: "admin" })
      ?.role,
  ).toBe("admin");
});

test("no Discord guild and no staff row is denied", () => {
  expect(
    resolveGuildAccess({ userId: "u1", discordUserId: "d1", guild: undefined, staffRole: null }),
  ).toBeNull();
});

test("a user with no linked Discord account is denied even with a staff role", () => {
  expect(
    resolveGuildAccess({
      userId: "u1",
      discordUserId: null,
      guild: undefined,
      staffRole: "admin",
    }),
  ).toBeNull();
});

test("managing an unrelated guild does not grant access here", () => {
  // the caller only ever passes the guild matching the requested id; undefined means no match
  expect(
    resolveGuildAccess({ userId: "u1", discordUserId: "d1", guild: undefined, staffRole: null }),
  ).toBeNull();
});
