import { and, count, eq, gte, schema } from "@modmail/db";
import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show ticket statistics for this server"),
  access: "staff",
  async execute({ interaction, services }) {
    if (!interaction.inCachedGuild()) return;
    const guildId = interaction.guildId;
    const db = services.db;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [open, closed, total, today, snippets, blocked] = await Promise.all([
      db
        .select({ c: count() })
        .from(schema.tickets)
        .where(and(eq(schema.tickets.guildId, guildId), eq(schema.tickets.status, "open")))
        .then((r) => r[0]?.c ?? 0),
      db
        .select({ c: count() })
        .from(schema.tickets)
        .where(and(eq(schema.tickets.guildId, guildId), eq(schema.tickets.status, "closed")))
        .then((r) => r[0]?.c ?? 0),
      db
        .select({ c: count() })
        .from(schema.tickets)
        .where(eq(schema.tickets.guildId, guildId))
        .then((r) => r[0]?.c ?? 0),
      db
        .select({ c: count() })
        .from(schema.tickets)
        .where(
          and(eq(schema.tickets.guildId, guildId), gte(schema.tickets.createdAt, startOfToday)),
        )
        .then((r) => r[0]?.c ?? 0),
      db
        .select({ c: count() })
        .from(schema.snippets)
        .where(eq(schema.snippets.guildId, guildId))
        .then((r) => r[0]?.c ?? 0),
      db
        .select({ c: count() })
        .from(schema.blockedUsers)
        .where(eq(schema.blockedUsers.guildId, guildId))
        .then((r) => r[0]?.c ?? 0),
    ]);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📊 Ticket Stats")
      .addFields(
        { name: "Open", value: `${open}`, inline: true },
        { name: "Closed", value: `${closed}`, inline: true },
        { name: "Total", value: `${total}`, inline: true },
        { name: "Opened today", value: `${today}`, inline: true },
        { name: "Snippets", value: `${snippets}`, inline: true },
        { name: "Blocked users", value: `${blocked}`, inline: true },
      );

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
