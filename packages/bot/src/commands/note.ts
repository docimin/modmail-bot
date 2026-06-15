import { SlashCommandBuilder, MessageFlags } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("note")
    .setDescription("Add an internal staff-only note to this ticket")
    .addStringOption((o) =>
      o.setName("text").setDescription("The note").setRequired(true).setMaxLength(2000),
    ),
  access: "staff",
  inTicketOnly: true,
  async execute({ interaction, services, ticket }) {
    if (!ticket) return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const content = interaction.options.getString("text", true);

    await services.tickets.addInternalNote(ticket, {
      authorId: interaction.user.id,
      authorTag: interaction.user.username,
      authorAvatar: interaction.user.displayAvatarURL(),
      content,
    });

    await interaction.editReply("📝 Note added.");
  },
};

export default command;
