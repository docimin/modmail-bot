import { eq, schema } from "@modmail/db";
import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("move")
    .setDescription("Move this ticket to a different category")
    .addStringOption((o) =>
      o
        .setName("category")
        .setDescription("Category to move this ticket to")
        .setRequired(true)
        .setAutocomplete(true),
    ),
  access: "staff",
  inTicketOnly: true,
  async autocomplete(interaction, services) {
    if (!interaction.inCachedGuild()) return;
    const focused = interaction.options.getFocused().toLowerCase();
    const rows = await services.db.query.ticketCategories.findMany({
      where: eq(schema.ticketCategories.guildId, interaction.guildId),
      limit: 25,
    });
    await interaction.respond(
      rows
        .filter((c) => c.name.toLowerCase().includes(focused))
        .slice(0, 25)
        .map((c) => ({ name: c.name, value: c.id })),
    );
  },
  async execute({ interaction, services, ticket }) {
    if (!ticket) return;
    const categoryId = interaction.options.getString("category", true);

    const category = await services.db.query.ticketCategories.findFirst({
      where: eq(schema.ticketCategories.id, categoryId),
    });
    if (!category || category.guildId !== ticket.guildId) {
      await interaction.reply({
        content: "❌ Category not found.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await services.db
      .update(schema.tickets)
      .set({ categoryId })
      .where(eq(schema.tickets.id, ticket.id));

    await interaction.reply({
      content: `✅ Ticket moved to **${category.name}**.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
