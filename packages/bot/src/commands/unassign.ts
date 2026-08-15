import { eq, schema } from "@modmail/db";
import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("unassign")
    .setDescription("Clear this ticket's assignee"),
  access: "staff",
  inTicketOnly: true,
  async execute({ interaction, services, ticket }) {
    if (!ticket) return;
    await services.db
      .update(schema.tickets)
      .set({ assignedStaffId: null })
      .where(eq(schema.tickets.id, ticket.id));
    await interaction.reply({ content: "✅ Unassigned.", flags: MessageFlags.Ephemeral });
  },
};

export default command;
