import { expect, test } from "bun:test";
import { PermissionFlagsBits } from "discord.js";
import { ticketOverwrites } from "./inbox.ts";

const base = {
  everyoneId: "guild-1",
  botId: "bot-1",
  staffRoleIds: ["staff-1"],
  adminRoleIds: ["admin-1"],
};

function find(list: ReturnType<typeof ticketOverwrites>, id: string) {
  return list.find((o) => o.id === id);
}

test("hides the channel from @everyone", () => {
  const o = find(ticketOverwrites(base), "guild-1");
  expect(o?.deny).toContain(PermissionFlagsBits.ViewChannel);
});

test("grants the bot access to the channel it creates", () => {
  const o = find(ticketOverwrites(base), "bot-1");
  expect(o?.allow).toContain(PermissionFlagsBits.ViewChannel);
  expect(o?.allow).toContain(PermissionFlagsBits.SendMessages);
  expect(o?.allow).toContain(PermissionFlagsBits.ReadMessageHistory);
});

test("grants each staff and admin role view access", () => {
  const list = ticketOverwrites(base);
  expect(find(list, "staff-1")?.allow).toContain(PermissionFlagsBits.ViewChannel);
  expect(find(list, "admin-1")?.allow).toContain(PermissionFlagsBits.ViewChannel);
});

test("a role listed as both staff and admin appears once", () => {
  const list = ticketOverwrites({ ...base, staffRoleIds: ["r"], adminRoleIds: ["r"] });
  expect(list.filter((o) => o.id === "r")).toHaveLength(1);
});

test("the bot entry is not duplicated when it also holds a staff role", () => {
  const list = ticketOverwrites({ ...base, staffRoleIds: ["bot-1"], adminRoleIds: [] });
  expect(list.filter((o) => o.id === "bot-1")).toHaveLength(1);
  expect(find(list, "bot-1")?.allow).toContain(PermissionFlagsBits.SendMessages);
});

test("works with no staff or admin roles configured", () => {
  const list = ticketOverwrites({ ...base, staffRoleIds: [], adminRoleIds: [] });
  expect(list).toHaveLength(2);
  expect(find(list, "bot-1")).toBeDefined();
});
