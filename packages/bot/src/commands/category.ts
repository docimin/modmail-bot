import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from "discord.js";
import { and, eq, schema } from "@modmail/db";
import { categoryInputSchema } from "@modmail/core";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("category")
    .setDescription("Manage ticket categories")
    .addSubcommand((s) =>
      s
        .setName("add")
        .setDescription("Create a category")
        .addStringOption((o) => o.setName("name").setDescription("Category name").setRequired(true))
        .addStringOption((o) => o.setName("description").setDescription("What this category is for"))
        .addStringOption((o) => o.setName("emoji").setDescription("Emoji shown next to the category")),
    )
    .addSubcommand((s) =>
      s
        .setName("remove")
        .setDescription("Delete a category")
        .addStringOption((o) => o.setName("name").setDescription("Category to remove").setRequired(true).setAutocomplete(true)),
    )
    .addSubcommand((s) => s.setName("list").setDescription("List all categories")),
  access: "admin",
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
  async execute({ interaction, services }) {
    if (!interaction.inCachedGuild()) return;
    const guildId = interaction.guildId;
    const sub = interaction.options.getSubcommand();
    const db = services.db;

    if (sub === "add") {
      const parsed = categoryInputSchema.safeParse({
        name: interaction.options.getString("name", true),
        description: interaction.options.getString("description") ?? undefined,
        emoji: interaction.options.getString("emoji") ?? undefined,
      });
      if (!parsed.success) {
        await interaction.reply({ content: `❌ ${parsed.error.issues[0]?.message}`, flags: MessageFlags.Ephemeral });
        return;
      }
      await db.insert(schema.ticketCategories).values({
        guildId,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        emoji: parsed.data.emoji ?? null,
      });
      await interaction.reply({ content: `✅ Category \`${parsed.data.name}\` created.`, flags: MessageFlags.Ephemeral });
      return;
    }

    if (sub === "remove") {
      const id = interaction.options.getString("name", true);
      const cat = await db.query.ticketCategories.findFirst({
        where: and(eq(schema.ticketCategories.guildId, guildId), eq(schema.ticketCategories.id, id)),
      });
      if (!cat) {
        await interaction.reply({ content: "❌ Category not found.", flags: MessageFlags.Ephemeral });
        return;
      }
      await db.delete(schema.ticketCategories).where(eq(schema.ticketCategories.id, id));
      await interaction.reply({ content: `🗑️ Category \`${cat.name}\` removed.`, flags: MessageFlags.Ephemeral });
      return;
    }

    // list
    const rows = await db.query.ticketCategories.findMany({
      where: eq(schema.ticketCategories.guildId, guildId),
    });
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Categories (${rows.length})`)
      .setDescription(
        rows.length
          ? rows
              .map((c) => `${c.emoji ? `${c.emoji} ` : ""}**${c.name}**${c.description ? ` — ${c.description}` : ""}`)
              .join("\n")
              .slice(0, 4000)
          : "No categories yet. Create one with `/category add`.",
      );
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
