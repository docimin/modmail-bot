import { SlashCommandBuilder, MessageFlags } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("contact")
    .setDescription("Open a ticket on behalf of a user")
    .addUserOption((o) =>
      o.setName("user").setDescription("The user to open a ticket for").setRequired(true),
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for opening").setMaxLength(1000),
    ),
  access: "staff",
  async execute({ interaction, services }) {
    if (!interaction.inCachedGuild()) return;
    const guildId = interaction.guildId;
    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason");

    const existing = await services.tickets.findOpenInGuild(guildId, target.id);
    if (existing) {
      await interaction.reply({
        content: `❌ <@${target.id}> already has an open ticket: <#${existing.channelId}>`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({ content: "Opening…", flags: MessageFlags.Ephemeral });

    try {
      const ticket = await services.tickets.createTicket({
        guildId,
        userId: target.id,
        openedById: interaction.user.id,
        openedByStaff: true,
        reason,
      });
      await interaction.editReply(
        `✅ Ticket opened: https://discord.com/channels/${guildId}/${ticket.channelId}`,
      );
    } catch (err) {
      await interaction.editReply(
        `❌ ${err instanceof Error ? err.message : "Failed to open ticket."}`,
      );
    }
  },
};

export default command;
