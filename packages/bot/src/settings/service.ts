import { DEFAULT_GUILD_CONFIG, parseGuildConfig } from "@modmail/core";
import { type Database, eq, type GuildConfig, schema } from "@modmail/db";

export interface ResolvedSettings {
  guildId: string;
  enabled: boolean;
  setupCompleted: boolean;
  mode: "threads" | "channels";
  inboxChannelId: string | null;
  logChannelId: string | null;
  transcriptChannelId: string | null;
  fallbackCategoryId: string | null;
  staffRoleIds: string[];
  adminRoleIds: string[];
  config: GuildConfig;
}

interface CacheEntry {
  value: ResolvedSettings;
  expires: number;
}

const TTL_MS = 5 * 60 * 1000;

export class SettingsService {
  private cache = new Map<string, CacheEntry>();

  constructor(private db: Database) {}

  invalidate(guildId: string): void {
    this.cache.delete(guildId);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  /** Get settings for a guild, or null if the guild has no settings row. */
  async get(guildId: string): Promise<ResolvedSettings | null> {
    const cached = this.cache.get(guildId);
    if (cached && cached.expires > Date.now()) return cached.value;

    const row = await this.db.query.guildSettings.findFirst({
      where: eq(schema.guildSettings.guildId, guildId),
    });
    if (!row) return null;

    const value = this.toResolved(row);
    this.cache.set(guildId, { value, expires: Date.now() + TTL_MS });
    return value;
  }

  /** Get settings, creating a default guild + settings row if missing. */
  async ensure(
    guildId: string,
    meta?: { name?: string; icon?: string | null; ownerId?: string | null },
  ): Promise<ResolvedSettings> {
    const existing = await this.get(guildId);
    if (existing) return existing;

    await this.db
      .insert(schema.guilds)
      .values({
        id: guildId,
        name: meta?.name ?? "Unknown",
        icon: meta?.icon ?? null,
        ownerId: meta?.ownerId ?? null,
        botPresent: true,
      })
      .onConflictDoUpdate({
        target: schema.guilds.id,
        set: { botPresent: true, leftAt: null },
      });

    const [row] = await this.db
      .insert(schema.guildSettings)
      .values({ guildId, config: DEFAULT_GUILD_CONFIG })
      .onConflictDoNothing()
      .returning();

    const resolved = row ? this.toResolved(row) : (await this.get(guildId))!;
    this.cache.set(guildId, {
      value: resolved,
      expires: Date.now() + TTL_MS,
    });
    return resolved;
  }

  private toResolved(row: typeof schema.guildSettings.$inferSelect): ResolvedSettings {
    return {
      guildId: row.guildId,
      enabled: row.enabled,
      setupCompleted: row.setupCompleted,
      mode: row.mode,
      inboxChannelId: row.inboxChannelId,
      logChannelId: row.logChannelId,
      transcriptChannelId: row.transcriptChannelId,
      fallbackCategoryId: row.fallbackCategoryId,
      staffRoleIds: row.staffRoleIds,
      adminRoleIds: row.adminRoleIds,
      config: parseGuildConfig(row.config),
    };
  }
}
