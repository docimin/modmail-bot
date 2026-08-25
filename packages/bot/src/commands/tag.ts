import { tagInputSchema } from "@modmail/core";
import { and, eq, inArray, schema } from "@modmail/db";
import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("tag")
    .setDescription("Manage and apply ticket tags")
    .addSubcommand((s) =>
      s
        .setName("create")
        .setDescription("Create a tag")
        .addStringOption((o) =>
          o.setName("name").setDescription("Tag name").setRequired(true).setMaxLength(50),
        )
        .addStringOption((o) => o.setName("color").setDescription("Hex color, e.g. #5865f2")),
    )
    .addSubcommand((s) =>
      s
        .setName("delete")
        .setDescription("Delete a tag")
        .addStringOption((o) =>
          o.setName("name").setDescription("Tag to delete").setRequired(true).setAutocomplete(true),
        ),
    )
    .addSubcommand((s) => s.setName("list").setDescription("List all tags"))
    .addSubcommand((s) =>
      s
        .setName("add")
        .setDescription("Apply a tag to this ticket")
        .addStringOption((o) =>
          o.setName("name").setDescription("Tag to apply").setRequired(true).setAutocomplete(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("remove")
        .setDescription("Remove a tag from this ticket")
        .addStringOption((o) =>
          o.setName("name").setDescription("Tag to remove").setRequired(true).setAutocomplete(true),
        ),
    ),
  access: "staff",
  async autocomplete(interaction, services) {
    if (!interaction.inCachedGuild()) return;
    const sub = interaction.options.getSubcommand();
    const focused = interaction.options.getFocused().toLowerCase();
    const db = services.db;

    if (sub === "remove") {
      const ticket = await services.tickets.findOpenByChannel(interaction.channelId);
      if (!ticket) {
        await interaction.respond([]);
        return;
      }
      const links = await db.query.ticketTags.findMany({
        where: eq(schema.ticketTags.ticketId, ticket.id),
      });
      const tagIds = links.map((l) => l.tagId);
      const rows = tagIds.length
        ? await db.query.tags.findMany({ where: inArray(schema.tags.id, tagIds) })
        : [];
      await interaction.respond(
        rows
          .filter((t) => t.name.toLowerCase().includes(focused))
          .slice(0, 25)
          .map((t) => ({ name: t.name, value: t.id })),
      );
      return;
    }

    const rows = await db.query.tags.findMany({
      where: eq(schema.tags.guildId, interaction.guildId),
      limit: 25,
    });
    await interaction.respond(
      rows
        .filter((t) => t.name.toLowerCase().includes(focused))
        .slice(0, 25)
        .map((t) => ({ name: t.name, value: t.id })),
    );
  },
  async execute({ interaction, services }) {
    if (!interaction.inCachedGuild()) return;
    const guildId = interaction.guildId;
    const sub = interaction.options.getSubcommand();
    const db = services.db;

    if (sub === "create") {
      const parsed = tagInputSchema.safeParse({
        name: interaction.options.getString("name", true),
        color: interaction.options.getString("color") ?? undefined,
      });
      if (!parsed.success) {
        await interaction.reply({
          content: `❌ ${parsed.error.issues[0]?.message}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await db
        .insert(schema.tags)
        .values({ guildId, name: parsed.data.name, color: parsed.data.color ?? null });
      await interaction.reply({
        content: `✅ Tag \`${parsed.data.name}\` created.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (sub === "delete") {
      const tagId = interaction.options.getString("name", true);
      await db.delete(schema.ticketTags).where(eq(schema.ticketTags.tagId, tagId));
      await db
        .delete(schema.tags)
        .where(and(eq(schema.tags.guildId, guildId), eq(schema.tags.id, tagId)));
      await interaction.reply({ content: "🗑️ Tag deleted.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (sub === "list") {
      const rows = await db.query.tags.findMany({ where: eq(schema.tags.guildId, guildId) });
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`Tags (${rows.length})`)
        .setDescription(
          rows.length
            ? rows
                .map((t) => `**${t.name}**${t.color ? ` — \`${t.color}\`` : ""}`)
                .join("\n")
                .slice(0, 4000)
            : "No tags yet. Create one with `/tag create`.",
        );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    const ticket = await services.tickets.findOpenByChannel(interaction.channelId);
    if (!ticket) {
      await interaction.reply({
        content: `❌ Use \`/tag ${sub}\` inside a ticket channel.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const tagId = interaction.options.getString("name", true);

    if (sub === "add") {
      await db
        .insert(schema.ticketTags)
        .values({ ticketId: ticket.id, tagId })
        .onConflictDoNothing();
      await interaction.reply({
        content: "✅ Tag added to this ticket.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // remove
    await db
      .delete(schema.ticketTags)
      .where(and(eq(schema.ticketTags.ticketId, ticket.id), eq(schema.ticketTags.tagId, tagId)));
    await interaction.reply({
      content: "🗑️ Tag removed from this ticket.",
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
