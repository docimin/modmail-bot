import { canManageDiscordGuild, type UserGuild } from "./discord.ts";

export interface GuildAccess {
  userId: string;
  discordUserId: string | null;
  role: "admin" | "staff";
}

export interface GuildAccessInput {
  userId: string;
  discordUserId: string | null;
  /** the caller's Discord guild matching the requested id, if they are in it */
  guild: UserGuild | undefined;
  /** role from the guild_staff table, if configured */
  staffRole: "admin" | "staff" | null;
}

export function resolveGuildAccess(input: GuildAccessInput): GuildAccess | null {
  const { userId, discordUserId, guild, staffRole } = input;

  if (guild && canManageDiscordGuild(guild)) return { userId, discordUserId, role: "admin" };

  // a staff row is keyed by Discord id, so an unlinked account can never match one
  if (discordUserId && staffRole) return { userId, discordUserId, role: staffRole };

  return null;
}
