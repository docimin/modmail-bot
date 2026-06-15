import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { and, eq, schema } from "@modmail/db";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("subscribe")
    .setDescription("Toggle notifications for new messages in this ticket"),
  access: "staff",
  inTicketOnly: true,
  async execute({ interaction, services, ticket }) {
    if (!ticket) return;
    const db = services.db;
    const existing = await db.query.ticketSubscriptions.findFirst({
      where: and(
        eq(schema.ticketSubscriptions.ticketId, ticket.id),
        eq(schema.ticketSubscriptions.userId, interaction.user.id),
      ),
    });

    if (existing) {
      await db
        .delete(schema.ticketSubscriptions)
        .where(
          and(
            eq(schema.ticketSubscriptions.ticketId, ticket.id),
            eq(schema.ticketSubscriptions.userId, interaction.user.id),
          ),
        );
      await interaction.reply({ content: "🔕 Unsubscribed.", flags: MessageFlags.Ephemeral });
      return;
    }

    await db
      .insert(schema.ticketSubscriptions)
      .values({ ticketId: ticket.id, userId: interaction.user.id });
    await interaction.reply({ content: "🔔 Subscribed.", flags: MessageFlags.Ephemeral });
  },
};

export default command;
