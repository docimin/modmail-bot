import { test, expect } from "bun:test";
import { renderMessage, renderPrefix, resolveColor } from "./messages.ts";
import { parseGuildConfig, mergeGuildConfig, DEFAULT_GUILD_CONFIG } from "./settings.ts";
import { resolveAccess, canManageGuild } from "./permissions.ts";
import { formatTicketName } from "./naming.ts";
import { PERMISSIONS } from "./constants.ts";

test("resolveColor parses hex and ints", () => {
  expect(resolveColor("#5865f2")).toBe(0x5865f2);
  expect(resolveColor("5865f2")).toBe(0x5865f2);
  expect(resolveColor("")).toBeUndefined();
  expect(resolveColor(null)).toBeUndefined();
});

test("renderMessage substitutes variables and resolves embed color", () => {
  const out = renderMessage(
    { embeds: [{ title: "Hi ${user}", description: "in ${server}", color: "#ed4245" }] },
    { user: "Faye", server: "Fyfu" },
  );
  expect(out.embeds?.[0]?.title).toBe("Hi Faye");
  expect(out.embeds?.[0]?.description).toBe("in Fyfu");
  expect(out.embeds?.[0]?.color).toBe(0xed4245);
});

test("renderMessage drops empty embeds and content", () => {
  const out = renderMessage({ embeds: [{ description: "${missing}" }] }, {});
  expect(out.embeds).toBeUndefined();
  expect(out.content).toBeUndefined();
});

test("$e[...] escapes markdown", () => {
  expect(renderPrefix("$e[${name}]", { name: "**bold**" })).toBe("\\*\\*bold\\*\\*");
});

test("parseGuildConfig fills every default", () => {
  const cfg = parseGuildConfig({});
  expect(cfg.accentColor).toBe("#5865f2");
  expect(cfg.maxOpenTicketsPerUser).toBe(1);
  expect(cfg).toEqual(DEFAULT_GUILD_CONFIG);
});

test("mergeGuildConfig overrides only provided keys", () => {
  const merged = mergeGuildConfig(DEFAULT_GUILD_CONFIG, { cooldownSeconds: 30 });
  expect(merged.cooldownSeconds).toBe(30);
  expect(merged.accentColor).toBe(DEFAULT_GUILD_CONFIG.accentColor);
});

test("resolveAccess grants admin via Manage Server and staff via role", () => {
  const settings = { staffRoleIds: ["staff1"], adminRoleIds: ["admin1"] };

  const manager = resolveAccess({ roleIds: [], permissions: PERMISSIONS.MANAGE_GUILD }, settings);
  expect(manager.isAdmin).toBe(true);
  expect(manager.isStaff).toBe(true);

  const staff = resolveAccess({ roleIds: ["staff1"], permissions: "0" }, settings);
  expect(staff.isStaff).toBe(true);
  expect(staff.isAdmin).toBe(false);

  const nobody = resolveAccess({ roleIds: ["random"], permissions: "0" }, settings);
  expect(nobody.isStaff).toBe(false);
});

test("canManageGuild respects owner and administrator", () => {
  expect(canManageGuild({ roleIds: [], permissions: "0", isOwner: true })).toBe(true);
  expect(canManageGuild({ roleIds: [], permissions: PERMISSIONS.ADMINISTRATOR })).toBe(true);
  expect(canManageGuild({ roleIds: [], permissions: "0" })).toBe(false);
});

test("formatTicketName sanitizes to a valid channel name", () => {
  expect(formatTicketName("{username}", { username: "Cool User!", userId: "1", number: 3 })).toBe("cool-user");
  expect(formatTicketName("ticket-{number}", { username: "x", userId: "1", number: 7 })).toBe("ticket-7");
});
