import { createServerFn } from "@tanstack/react-start";
import { requireGuildAccess } from "#/server/access.ts";
import { botApi } from "#/server/bot-api.ts";

export const getChannels = createServerFn({ method: "GET" })
  .validator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return (await botApi.channels(data.guildId)) ?? [];
  });

export const getRoles = createServerFn({ method: "GET" })
  .validator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return (await botApi.roles(data.guildId)) ?? [];
  });

export const getEmojis = createServerFn({ method: "GET" })
  .validator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return (await botApi.emojis(data.guildId)) ?? [];
  });

export const getMember = createServerFn({ method: "GET" })
  .validator((d: { guildId: string; userId: string }) => d)
  .handler(async ({ data }) => {
    await requireGuildAccess(data.guildId);
    return botApi.member(data.guildId, data.userId);
  });

export const getBotHealth = createServerFn({ method: "GET" }).handler(async () => {
  return botApi.health();
});
