import { createServerFn } from "@tanstack/react-start";
import { parseGuildConfig } from "@modmail/core";
import { db, schema, eq, inArray } from "#/server/db.ts";
import { requireUser, requireGuildAccess } from "#/server/access.ts";
import {
  getUserGuilds,
  canManageDiscordGuild,
  guildIconUrl,
} from "#/server/discord.ts";
import { botApi } from "#/server/bot-api.ts";

export interface DashboardGuild {
  id: string;
  name: string;
  icon: string | null;
  botPresent: boolean;
  enabled: boolean;
  setupCompleted: boolean;
}

/** Guilds the signed-in user can manage, annotated with bot presence + setup state. */
export const getMyGuilds = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardGuild[]> => {
    const { headers } = await requireUser();
    const manageable = (await getUserGuilds(headers)).filter(canManageDiscordGuild);
    if (manageable.length === 0) return [];

    const botGuilds = await botApi.guilds();
    const botIds = new Set((botGuilds ?? []).map((g) => g.id));

    const settingsRows = await db.query.guildSettings.findMany({
      where: inArray(
        schema.guildSettings.guildId,
        manageable.map((g) => g.id),
      ),
    });
    const settingsMap = new Map(settingsRows.map((s) => [s.guildId, s]));

    return manageable
      .map((g) => ({
        id: g.id,
        name: g.name,
        icon: guildIconUrl(g.id, g.icon, 128),
        botPresent: botIds.has(g.id),
        enabled: settingsMap.get(g.id)?.enabled ?? false,
        setupCompleted: !!(
          settingsMap.get(g.id)?.enabled && settingsMap.get(g.id)?.inboxChannelId
        ),
      }))
      .sort((a, b) => Number(b.botPresent) - Number(a.botPresent));
  },
);

export const getGuildContext = createServerFn({ method: "GET" })
  .validator((d: { guildId: string }) => d)
  .handler(async ({ data }) => {
    const access = await requireGuildAccess(data.guildId);
    const bot = await botApi.guild(data.guildId);

    const row = await db.query.guildSettings.findFirst({
      where: eq(schema.guildSettings.guildId, data.guildId),
    });

    return {
      guildId: data.guildId,
      name: bot?.name ?? "Server",
      icon: bot?.icon ?? null,
      botPresent: !!bot,
      role: access.role,
      enabled: row?.enabled ?? false,
      setupCompleted: !!(row?.enabled && row?.inboxChannelId),
      mode: row?.mode ?? "threads",
      inboxChannelId: row?.inboxChannelId ?? null,
      logChannelId: row?.logChannelId ?? null,
      transcriptChannelId: row?.transcriptChannelId ?? null,
      fallbackCategoryId: row?.fallbackCategoryId ?? null,
      staffRoleIds: row?.staffRoleIds ?? [],
      adminRoleIds: row?.adminRoleIds ?? [],
      config: parseGuildConfig(row?.config),
    };
  });

export type GuildContext = Awaited<ReturnType<typeof getGuildContext>>;
