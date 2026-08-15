import { PERMISSIONS } from "./constants.ts";

export interface MemberAccessInput {
  roleIds: string[];
  /** Discord permission bitfield as string|bigint (from member.permissions). */
  permissions: string | bigint;
  isOwner?: boolean;
}

export interface AccessSettings {
  staffRoleIds: string[];
  adminRoleIds: string[];
}

function toBig(p: string | bigint): bigint {
  return typeof p === "bigint" ? p : BigInt(p || "0");
}

export function hasPermissionBit(permissions: string | bigint, flag: bigint): boolean {
  const bits = toBig(permissions);
  if ((bits & PERMISSIONS.ADMINISTRATOR) === PERMISSIONS.ADMINISTRATOR) return true;
  return (bits & flag) === flag;
}

/** Can this member configure the bot (Discord-level server management)? */
export function canManageGuild(member: MemberAccessInput): boolean {
  return member.isOwner === true || hasPermissionBit(member.permissions, PERMISSIONS.MANAGE_GUILD);
}

function intersects(a: string[], b: string[]): boolean {
  return a.some((x) => b.includes(x));
}

export interface ResolvedAccess {
  isAdmin: boolean;
  isStaff: boolean;
  canConfigure: boolean;
}

export function resolveAccess(member: MemberAccessInput, settings: AccessSettings): ResolvedAccess {
  const manage = canManageGuild(member);
  const isAdmin = manage || intersects(member.roleIds, settings.adminRoleIds);
  const isStaff =
    isAdmin ||
    intersects(member.roleIds, settings.staffRoleIds) ||
    intersects(member.roleIds, settings.adminRoleIds);
  return { isAdmin, isStaff, canConfigure: isAdmin };
}
