import { type ResolvedAccess, resolveAccess } from "@modmail/core";
import type { GuildMember } from "discord.js";
import type { ResolvedSettings } from "../settings/service.ts";

export function memberAccess(member: GuildMember, settings: ResolvedSettings): ResolvedAccess {
  return resolveAccess(
    {
      roleIds: [...member.roles.cache.keys()],
      permissions: member.permissions.bitfield,
      isOwner: member.id === member.guild.ownerId,
    },
    { staffRoleIds: settings.staffRoleIds, adminRoleIds: settings.adminRoleIds },
  );
}
