import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./auth.ts";
import { getUserGuilds, canManageDiscordGuild, getDiscordUserId } from "./discord.ts";
import { db, schema, and, eq } from "./db.ts";

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

export interface GuildAccess {
  userId: string;
  discordUserId: string | null;
  role: "admin" | "staff";
}

/** Ensure the signed-in user may manage the given guild (Discord MANAGE_GUILD or configured staff). */
export async function requireGuildAccess(guildId: string): Promise<GuildAccess> {
  const { session, headers } = await requireUser();
  const discordUserId = await getDiscordUserId(session.user.id);

  const guilds = await getUserGuilds(headers);
  const g = guilds.find((x) => x.id === guildId);
  if (g && canManageDiscordGuild(g))
    return { userId: session.user.id, discordUserId, role: "admin" };

  if (discordUserId) {
    const staff = await db.query.guildStaff.findFirst({
      where: and(
        eq(schema.guildStaff.guildId, guildId),
        eq(schema.guildStaff.userId, discordUserId),
      ),
    });
    if (staff) return { userId: session.user.id, discordUserId, role: staff.role };
  }

  throw new ForbiddenError();
}
