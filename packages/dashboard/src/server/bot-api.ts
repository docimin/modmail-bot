import type {
  BotGuildDTO,
  DiscordChannelDTO,
  DiscordEmojiDTO,
  DiscordRoleDTO,
  GuildMemberDTO,
} from "@modmail/core";
import { env } from "./env.ts";

async function botFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${env.BOT_API_URL}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${env.INTERNAL_API_SECRET}`,
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      console.error(`[bot-api] ${init?.method ?? "GET"} ${path} -> ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[bot-api] ${init?.method ?? "GET"} ${path} unreachable:`, err);
    return null;
  }
}

export const botApi = {
  health: () => botFetch<{ ok: boolean; ready: boolean }>("/health"),
  guilds: () => botFetch<BotGuildDTO[]>("/guilds"),
  guild: (id: string) => botFetch<BotGuildDTO>(`/guilds/${id}`),
  channels: (id: string) => botFetch<DiscordChannelDTO[]>(`/guilds/${id}/channels`),
  roles: (id: string) => botFetch<DiscordRoleDTO[]>(`/guilds/${id}/roles`),
  emojis: (id: string) => botFetch<DiscordEmojiDTO[]>(`/guilds/${id}/emojis`),
  member: (id: string, userId: string) =>
    botFetch<GuildMemberDTO>(`/guilds/${id}/members/${userId}`),
  invalidate: (id: string) =>
    botFetch<{ ok: boolean }>(`/guilds/${id}/invalidate`, { method: "POST" }),
  reply: (guildId: string, ticketId: string, body: Record<string, unknown>) =>
    botFetch<{ ok: boolean; error?: string }>(`/guilds/${guildId}/tickets/${ticketId}/reply`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  note: (guildId: string, ticketId: string, body: Record<string, unknown>) =>
    botFetch<{ ok: boolean }>(`/guilds/${guildId}/tickets/${ticketId}/note`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  close: (guildId: string, ticketId: string, body: Record<string, unknown>) =>
    botFetch<{ ok: boolean }>(`/guilds/${guildId}/tickets/${ticketId}/close`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  assign: (guildId: string, ticketId: string, body: Record<string, unknown>) =>
    botFetch<{ ok: boolean }>(`/guilds/${guildId}/tickets/${ticketId}/assign`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  priority: (guildId: string, ticketId: string, body: Record<string, unknown>) =>
    botFetch<{ ok: boolean }>(`/guilds/${guildId}/tickets/${ticketId}/priority`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  refreshCommands: () =>
    botFetch<{ ok: boolean; count: number }>("/commands/refresh", { method: "POST" }),
};
