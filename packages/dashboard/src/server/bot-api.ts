import type {
  BotGuildDTO,
  DiscordChannelDTO,
  DiscordRoleDTO,
  DiscordEmojiDTO,
  GuildMemberDTO,
} from "@modmail/core";
import { env } from "./env.ts";

async function botFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(`${env.BOT_API_URL}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${env.BOT_API_SECRET}`,
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
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
  reply: (ticketId: string, body: Record<string, unknown>) =>
    botFetch<{ ok: boolean; error?: string }>(`/tickets/${ticketId}/reply`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  note: (ticketId: string, body: Record<string, unknown>) =>
    botFetch<{ ok: boolean }>(`/tickets/${ticketId}/note`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  close: (ticketId: string, body: Record<string, unknown>) =>
    botFetch<{ ok: boolean }>(`/tickets/${ticketId}/close`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  assign: (ticketId: string, body: Record<string, unknown>) =>
    botFetch<{ ok: boolean }>(`/tickets/${ticketId}/assign`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  priority: (ticketId: string, body: Record<string, unknown>) =>
    botFetch<{ ok: boolean }>(`/tickets/${ticketId}/priority`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  refreshCommands: () =>
    botFetch<{ ok: boolean; count: number }>("/commands/refresh", { method: "POST" }),
};
