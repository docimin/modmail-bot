import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("edit")
    .setDescription("Edit a previously-sent staff reply")
    .addStringOption((o) =>
      o.setName("id").setDescription("The inbox message id").setRequired(true),
    )
    .addStringOption((o) =>
      o
        .setName("content")
        .setDescription("New message content")
        .setRequired(true)
        .setMaxLength(2000),
    ),
  access: "staff",
  inTicketOnly: true,
  async execute({ interaction, services, ticket }) {
    if (!ticket) return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const id = interaction.options.getString("id", true);
    const content = interaction.options.getString("content", true).replaceAll("\\n", "\n");

    const ok = await services.tickets.editStaffMessage(ticket, id, content);
    await interaction.editReply(ok ? "✅ Edited." : "❌ Message not found.");
  },
};

export default command;
