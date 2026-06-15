// Shared DTOs for the bot internal HTTP API (consumed by the dashboard).

export interface DiscordChannelDTO {
  id: string;
  name: string;
  type: number;
  position: number;
  parentId: string | null;
}

export interface DiscordRoleDTO {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
}

export interface DiscordEmojiDTO {
  id: string;
  name: string;
  animated: boolean;
  url: string;
}

export interface BotGuildDTO {
  id: string;
  name: string;
  icon: string | null;
  ownerId: string | null;
  memberCount: number | null;
}

export interface GuildMemberDTO {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  roleIds: string[];
  joinedAt: string | null;
  bot: boolean;
}

export interface GuildStatsDTO {
  openTickets: number;
  closedTickets: number;
  ticketsToday: number;
  ticketsThisWeek: number;
  avgFirstResponseMinutes: number | null;
  blockedUsers: number;
  snippets: number;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}
