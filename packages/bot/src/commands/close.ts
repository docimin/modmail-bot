import { schema } from "@modmail/db";
import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Close this ticket")
    .addStringOption((o) => o.setName("reason").setDescription("Close reason").setMaxLength(1000))
    .addIntegerOption((o) =>
      o
        .setName("delay")
        .setDescription("Close after this many minutes")
        .setMinValue(1)
        .setMaxValue(10080),
    )
    .addBooleanOption((o) => o.setName("silent").setDescription("Don't notify the user")),
  access: "staff",
  inTicketOnly: true,
  async execute({ interaction, services, ticket }) {
    if (!ticket) return;
    const reason = interaction.options.getString("reason");
    const delay = interaction.options.getInteger("delay");
    const silent = interaction.options.getBoolean("silent") ?? false;

    if (delay && delay > 0) {
      await services.db.insert(schema.scheduledTasks).values({
        guildId: ticket.guildId,
        type: "close_ticket",
        ticketId: ticket.id,
        runAt: new Date(Date.now() + delay * 60_000),
        payload: { reason, silent },
        createdById: interaction.user.id,
      });
      await interaction.reply({
        content: `🕒 This ticket will close in ${delay} minute(s).`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.reply({ content: "Closing ticket…", flags: MessageFlags.Ephemeral });
    await services.tickets.close(ticket, {
      byId: interaction.user.id,
      byTag: interaction.user.username,
      reason,
      silent,
    });
  },
};

export default command;
