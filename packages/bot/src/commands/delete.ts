import { SlashCommandBuilder, MessageFlags } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete a staff reply you sent in this ticket")
    .addStringOption((o) =>
      o.setName("id").setDescription("The inbox message id of the reply").setRequired(true),
    ),
  access: "staff",
  inTicketOnly: true,
  async execute({ interaction, services, ticket }) {
    if (!ticket) return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const id = interaction.options.getString("id", true);

    const ok = await services.tickets.deleteStaffMessage(ticket, id);
    await interaction.editReply(ok ? "🗑️ Deleted." : "❌ Message not found.");
  },
};

export default command;
