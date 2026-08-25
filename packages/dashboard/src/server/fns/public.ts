import { createServerFn } from "@tanstack/react-start";
import { env } from "#/server/env.ts";

// View Channels, Manage Channels, Manage Messages, Embed Links, Attach Files,
// Read Message History, Manage Webhooks, Manage Threads, Create Private Threads,
// Send Messages, Send Messages in Threads, Manage Roles.
// Manage Roles is required because "channels" mode creates ticket channels with
// permission overwrites, which Discord rejects without it.
const INVITE_PERMISSIONS = (
  (1n << 10n) |
  (1n << 4n) |
  (1n << 13n) |
  (1n << 14n) |
  (1n << 15n) |
  (1n << 16n) |
  (1n << 29n) |
  (1n << 34n) |
  (1n << 36n) |
  (1n << 11n) |
  (1n << 38n) |
  (1n << 28n)
).toString();

export const getPublicConfig = createServerFn({ method: "GET" }).handler(async () => {
  const clientId = env.DISCORD_CLIENT_ID;
  const inviteUrl =
    env.DISCORD_INVITE_URL ||
    `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${INVITE_PERMISSIONS}&scope=bot+applications.commands`;
  return {
    clientId,
    inviteUrl,
    supportUrl: env.SUPPORT_SERVER_URL ?? null,
  };
});
