import {
  type Client,
  type Guild,
  type GuildMember,
  ChannelType,
  type GuildBasedChannel,
} from "discord.js";
import type {
  DiscordChannelDTO,
  DiscordRoleDTO,
  DiscordEmojiDTO,
  GuildMemberDTO,
  BotGuildDTO,
} from "@modmail/core";

export function guildToDTO(guild: Guild): BotGuildDTO {
  return {
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL({ size: 128 }) ?? null,
    ownerId: guild.ownerId,
    memberCount: guild.memberCount ?? null,
  };
}

const TEXTLIKE = new Set<number>([
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.GuildForum,
]);

export function channelsToDTO(guild: Guild): DiscordChannelDTO[] {
  return [...guild.channels.cache.values()]
    .filter(
      (c): c is GuildBasedChannel =>
        TEXTLIKE.has(c.type) || c.type === ChannelType.GuildCategory,
    )
    .map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      position: "position" in c ? c.position : 0,
      parentId: c.parentId ?? null,
    }))
    .sort((a, b) => a.position - b.position);
}

export function rolesToDTO(guild: Guild): DiscordRoleDTO[] {
  return [...guild.roles.cache.values()]
    .filter((r) => r.id !== guild.id)
    .map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color,
      position: r.position,
      managed: r.managed,
    }))
    .sort((a, b) => b.position - a.position);
}

export function emojisToDTO(guild: Guild): DiscordEmojiDTO[] {
  return [...guild.emojis.cache.values()].map((e) => ({
    id: e.id,
    name: e.name ?? "",
    animated: e.animated ?? false,
    url: e.imageURL({ size: 64 }) ?? "",
  }));
}

export function memberToDTO(member: GuildMember): GuildMemberDTO {
  return {
    id: member.id,
    username: member.user.username,
    displayName: member.displayName,
    avatar: member.displayAvatarURL({ size: 128 }),
    roleIds: [...member.roles.cache.keys()].filter((id) => id !== member.guild.id),
    joinedAt: member.joinedAt?.toISOString() ?? null,
    bot: member.user.bot,
  };
}

export async function fetchMemberSafe(
  guild: Guild,
  userId: string,
): Promise<GuildMember | null> {
  return guild.members.fetch(userId).catch(() => null);
}

export async function fetchGuildSafe(
  client: Client,
  guildId: string,
): Promise<Guild | null> {
  return client.guilds.fetch(guildId).catch(() => null);
}
