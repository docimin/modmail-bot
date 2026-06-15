import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { eq, schema } from "@modmail/db";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("assign")
    .setDescription("Assign a staff member to this ticket")
    .addUserOption((o) =>
      o.setName("user").setDescription("Staff member to assign (defaults to you)"),
    ),
  access: "staff",
  inTicketOnly: true,
  async execute({ interaction, services, ticket }) {
    if (!ticket) return;
    const target = interaction.options.getUser("user") ?? interaction.user;

    await services.db
      .update(schema.tickets)
      .set({ assignedStaffId: target.id })
      .where(eq(schema.tickets.id, ticket.id));

    await services.tickets.audit(
      ticket.guildId,
      interaction.user.id,
      "ticket.assign",
      "ticket",
      ticket.id,
      { assignedStaffId: target.id },
    );

    await interaction.reply({
      content: `✅ Assigned to <@${target.id}>.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
