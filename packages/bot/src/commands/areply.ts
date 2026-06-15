import { SlashCommandBuilder, MessageFlags } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("areply")
    .setDescription("Reply anonymously to the user in this ticket")
    .addStringOption((o) =>
      o.setName("message").setDescription("Your reply").setRequired(true).setMaxLength(2000),
    ),
  access: "staff",
  inTicketOnly: true,
  async execute({ interaction, services, ticket }) {
    if (!ticket) return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const content = interaction.options
      .getString("message", true)
      .replaceAll("\\n", "\n");

    const result = await services.tickets.sendStaffReply(ticket, {
      authorId: interaction.user.id,
      authorTag: interaction.user.username,
      authorAvatar: interaction.user.displayAvatarURL(),
      content,
      anonymous: true,
    });

    await interaction.editReply(
      result.ok ? "✅ Anonymous reply sent." : `❌ ${result.error ?? "Failed to send."}`,
    );
  },
};

export default command;
