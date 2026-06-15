import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Show a user's ticket history")
    .addUserOption((o) =>
      o.setName("user").setDescription("The user to look up").setRequired(true),
    ),
  access: "staff",
  async execute({ interaction, services }) {
    if (!interaction.inCachedGuild()) return;
    const guildId = interaction.guildId;
    const user = interaction.options.getUser("user", true);

    const tickets = await services.tickets.recentTicketsByUser(guildId, user.id);
    const base = process.env.DASHBOARD_URL ?? "";

    const lines = tickets.map((t) => {
      const created = Math.floor(t.createdAt.getTime() / 1000);
      const link = `${base}/dashboard/${guildId}/tickets/${t.id}`;
      return `[#${t.number}](${link}) • <t:${created}:R> • ${t.status} • ${t.reason ?? "—"}`;
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Ticket history — ${user.username}`)
      .setDescription(
        lines.length
          ? lines.join("\n").slice(0, 4000)
          : "No tickets found for this user.",
      );

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
