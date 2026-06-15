import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { and, eq, schema } from "@modmail/db";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("unblock")
    .setDescription("Remove a user's block")
    .addUserOption((o) =>
      o.setName("user").setDescription("User to unblock").setRequired(true),
    ),
  access: "staff",
  async execute({ interaction, services }) {
    if (!interaction.inCachedGuild()) return;
    const user = interaction.options.getUser("user", true);
    await services.db
      .delete(schema.blockedUsers)
      .where(
        and(
          eq(schema.blockedUsers.guildId, interaction.guildId),
          eq(schema.blockedUsers.userId, user.id),
        ),
      );
    await interaction.reply({
      content: `✅ ${user.tag} is no longer blocked.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
