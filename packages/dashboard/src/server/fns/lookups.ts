import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireGuildAccess, requireUser } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";

const snowflake = z.string().regex(/^\d{15,20}$/, "Invalid Discord id");
const guildRef = z.object({ guildId: snowflake });

export const getChannels = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return (await botApi.channels(data.guildId)) ?? [];
  });

export const getRoles = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return (await botApi.roles(data.guildId)) ?? [];
  });

export const getEmojis = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return (await botApi.emojis(data.guildId)) ?? [];
  });

export const getMember = createServerFn({ method: "GET" })
  .validator((d: unknown) => guildRef.extend({ userId: snowflake }).parse(d))
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return botApi.member(data.guildId, data.userId);
  });

export const getBotHealth = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser();
  return botApi.health();
});
