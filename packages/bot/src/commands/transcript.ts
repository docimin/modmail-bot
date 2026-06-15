import { SlashCommandBuilder, MessageFlags } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("transcript")
    .setDescription("Get a link to this ticket's transcript"),
  access: "staff",
  inTicketOnly: true,
  async execute({ interaction, ticket }) {
    if (!ticket) return;
    const url = `${process.env.DASHBOARD_URL ?? ""}/dashboard/${ticket.guildId}/tickets/${ticket.id}`;
    await interaction.reply({
      content: `📄 Transcript: ${url}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
