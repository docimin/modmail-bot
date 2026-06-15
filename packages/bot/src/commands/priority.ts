import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { eq, schema } from "@modmail/db";
import type { BotCommand } from "../framework.ts";

const emoji = { low: "🟢", normal: "⚪", high: "🟠", urgent: "🔴" } as const;

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("priority")
    .setDescription("Set the priority of this ticket")
    .addStringOption((o) =>
      o
        .setName("level")
        .setDescription("Priority level")
        .setRequired(true)
        .addChoices(
          { name: "Low", value: "low" },
          { name: "Normal", value: "normal" },
          { name: "High", value: "high" },
          { name: "Urgent", value: "urgent" },
        ),
    ),
  access: "staff",
  inTicketOnly: true,
  async execute({ interaction, services, ticket }) {
    if (!ticket) return;
    const level = interaction.options.getString("level", true) as keyof typeof emoji;

    await services.db
      .update(schema.tickets)
      .set({ priority: level })
      .where(eq(schema.tickets.id, ticket.id));

    await interaction.reply({
      content: `${emoji[level]} Priority set to **${level}**.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
