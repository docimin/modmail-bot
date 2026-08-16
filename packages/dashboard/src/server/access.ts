import { getRequestHeaders } from "@tanstack/react-start/server";
import { type GuildAccess, resolveGuildAccess } from "./access-policy.ts";
import { auth } from "./auth.ts";
import { and, db, eq, schema } from "./db.ts";
import { getDiscordUserId, getUserGuilds } from "./discord.ts";

export function currentHeaders(): Headers {
  return new Headers(getRequestHeaders() as HeadersInit);
}

export class AuthError extends Error {
  constructor() {
    super("UNAUTHORIZED");
  }
}
export class ForbiddenError extends Error {
  constructor() {
    super("FORBIDDEN");
  }
}

export async function requireUser() {
  const headers = currentHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session?.user) throw new AuthError();
  return { session, headers };
}

export type { GuildAccess } from "./access-policy.ts";

/** Ensure the signed-in user may manage the given guild (Discord MANAGE_GUILD or configured staff). */
export async function requireGuildAccess(guildId: string): Promise<GuildAccess> {
  const { session, headers } = await requireUser();
  const discordUserId = await getDiscordUserId(session.user.id);

  const guilds = await getUserGuilds(headers);
  const guild = guilds.find((x) => x.id === guildId);

  const staff = discordUserId
    ? await db.query.guildStaff.findFirst({
        where: and(
          eq(schema.guildStaff.guildId, guildId),
          eq(schema.guildStaff.userId, discordUserId),
        ),
      })
    : null;

  const access = resolveGuildAccess({
    userId: session.user.id,
    discordUserId,
    guild,
    staffRole: staff?.role ?? null,
  });
  if (!access) throw new ForbiddenError();
  return access;
}
