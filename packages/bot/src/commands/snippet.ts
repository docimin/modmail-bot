import { snippetInputSchema } from "@modmail/core";
import { and, eq, schema } from "@modmail/db";
import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("snippet")
    .setDescription("Manage and send saved replies")
    .addSubcommand((s) =>
      s
        .setName("add")
        .setDescription("Create a snippet")
        .addStringOption((o) => o.setName("name").setDescription("Snippet name").setRequired(true))
        .addStringOption((o) =>
          o.setName("content").setDescription("Snippet content").setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("edit")
        .setDescription("Edit a snippet")
        .addStringOption((o) =>
          o.setName("name").setDescription("Snippet name").setRequired(true).setAutocomplete(true),
        )
        .addStringOption((o) =>
          o.setName("content").setDescription("New content").setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("remove")
        .setDescription("Delete a snippet")
        .addStringOption((o) =>
          o.setName("name").setDescription("Snippet name").setRequired(true).setAutocomplete(true),
        ),
    )
    .addSubcommand((s) => s.setName("list").setDescription("List all snippets"))
    .addSubcommand((s) =>
      s
        .setName("send")
        .setDescription("Send a snippet in this ticket")
        .addStringOption((o) =>
          o.setName("name").setDescription("Snippet name").setRequired(true).setAutocomplete(true),
        ),
    ),
  access: "staff",
  async autocomplete(interaction, services) {
    if (!interaction.inCachedGuild()) return;
    const focused = interaction.options.getFocused().toLowerCase();
    const rows = await services.db.query.snippets.findMany({
      where: eq(schema.snippets.guildId, interaction.guildId),
      limit: 25,
    });
    await interaction.respond(
      rows
        .filter((s) => s.name.toLowerCase().includes(focused))
        .slice(0, 25)
        .map((s) => ({ name: s.name, value: s.name })),
    );
  },
  async execute({ interaction, services, ticket }) {
    if (!interaction.inCachedGuild()) return;
    const guildId = interaction.guildId;
    const sub = interaction.options.getSubcommand();
    const db = services.db;

    if (sub === "add" || sub === "edit") {
      const parsed = snippetInputSchema.safeParse({
        name: interaction.options.getString("name", true),
        content: interaction.options.getString("content", true),
      });
      if (!parsed.success) {
        await interaction.reply({
          content: `❌ ${parsed.error.issues[0]?.message}`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await db
        .insert(schema.snippets)
        .values({
          guildId,
          name: parsed.data.name,
          content: parsed.data.content,
          createdById: interaction.user.id,
        })
        .onConflictDoUpdate({
          target: [schema.snippets.guildId, schema.snippets.name],
          set: { content: parsed.data.content, updatedAt: new Date() },
        });
      await interaction.reply({
        content: `✅ Snippet \`${parsed.data.name}\` saved.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (sub === "remove") {
      const name = interaction.options.getString("name", true);
      await db
        .delete(schema.snippets)
        .where(and(eq(schema.snippets.guildId, guildId), eq(schema.snippets.name, name)));
      await interaction.reply({
        content: `🗑️ Snippet \`${name}\` removed.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (sub === "list") {
      const rows = await db.query.snippets.findMany({
        where: eq(schema.snippets.guildId, guildId),
      });
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`Snippets (${rows.length})`)
        .setDescription(
          rows.length
            ? rows
                .map((s) => `**${s.name}** — ${s.content.slice(0, 60)}`)
                .join("\n")
                .slice(0, 4000)
            : "No snippets yet. Create one with `/snippet add`.",
        );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    // send
    if (!ticket) {
      await interaction.reply({
        content: "Use `/snippet send` inside a ticket channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const name = interaction.options.getString("name", true);
    const snippet = await db.query.snippets.findFirst({
      where: and(eq(schema.snippets.guildId, guildId), eq(schema.snippets.name, name)),
    });
    if (!snippet) {
      await interaction.reply({
        content: `❌ Snippet \`${name}\` not found.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const result = await services.tickets.sendStaffReply(ticket, {
      authorId: interaction.user.id,
      authorTag: interaction.user.username,
      authorAvatar: interaction.user.displayAvatarURL(),
      content: snippet.content,
      anonymous: false,
      snippetId: snippet.id,
    });
    await interaction.editReply(result.ok ? "✅ Snippet sent." : `❌ ${result.error}`);
  },
};

export default command;
