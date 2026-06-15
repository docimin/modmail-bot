import { PERMISSIONS } from "@modmail/core";
import { auth } from "./auth.ts";
import { db, schema, and, eq } from "./db.ts";

export interface UserGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

const guildCache = new Map<string, { guilds: UserGuild[]; expires: number }>();
const TTL = 60_000;

type HeadersLike = Headers;

/** The Discord user id (snowflake) backing a better-auth user. */
export async function getDiscordUserId(userId: string): Promise<string | null> {
  const acc = await db.query.account.findFirst({
    where: and(eq(schema.account.userId, userId), eq(schema.account.providerId, "discord")),
    columns: { accountId: true },
  });
  return acc?.accountId ?? null;
}

/** Fetch the signed-in user's Discord guilds (with their permissions), cached briefly. */
export async function getUserGuilds(headers: HeadersLike): Promise<UserGuild[]> {
  const session = await auth.api.getSession({ headers });
  if (!session?.user) return [];

  const cached = guildCache.get(session.user.id);
  if (cached && cached.expires > Date.now()) return cached.guilds;

  const accounts = await auth.api.listUserAccounts({ headers }).catch(() => []);
  const discord = accounts.find((a) => a.providerId === "discord");
  if (!discord) return [];

  const token = await auth.api
    .getAccessToken({
      body: { providerId: "discord", accountId: discord.accountId },
      headers,
    })
    .catch(() => null);
  const accessToken = token?.accessToken;
  if (!accessToken) return [];

  const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  const guilds = (await res.json().catch(() => [])) as UserGuild[];

  guildCache.set(session.user.id, { guilds, expires: Date.now() + TTL });
  return guilds;
}

export function canManageDiscordGuild(g: UserGuild): boolean {
  if (g.owner) return true;
  const perms = BigInt(g.permissions || "0");
  return (
    (perms & PERMISSIONS.ADMINISTRATOR) === PERMISSIONS.ADMINISTRATOR ||
    (perms & PERMISSIONS.MANAGE_GUILD) === PERMISSIONS.MANAGE_GUILD
  );
}

export function guildIconUrl(id: string, icon: string | null, size = 64): string | null {
  if (!icon) return null;
  const ext = icon.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${id}/${icon}.${ext}?size=${size}`;
}
