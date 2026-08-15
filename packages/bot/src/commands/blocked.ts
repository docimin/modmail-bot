import { eq, schema } from "@modmail/db";
import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("blocked")
    .setDescription("List blocked users in this server"),
  access: "staff",
  async execute({ interaction, services }) {
    if (!interaction.inCachedGuild()) return;
    const rows = await services.db.query.blockedUsers.findMany({
      where: eq(schema.blockedUsers.guildId, interaction.guildId),
      limit: 50,
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle(`Blocked users (${rows.length})`)
      .setDescription(
        rows.length
          ? rows
              .map((b) => {
                const reason = b.reason ?? "No reason";
                const expiry = b.expiresAt
                  ? ` — expires <t:${Math.floor(b.expiresAt.getTime() / 1000)}:R>`
                  : "";
                return `<@${b.userId}> — ${reason}${expiry}`;
              })
              .join("\n")
              .slice(0, 4000)
          : "No blocked users. ✅",
      );

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
