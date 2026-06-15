import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { schema } from "@modmail/db";
import { blockInputSchema } from "@modmail/core";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("block")
    .setDescription("Block a user from opening tickets")
    .addUserOption((o) =>
      o.setName("user").setDescription("User to block").setRequired(true),
    )
    .addStringOption((o) =>
      o.setName("reason").setDescription("Reason for the block").setMaxLength(1000),
    )
    .addIntegerOption((o) =>
      o.setName("duration").setDescription("Block duration in minutes").setMinValue(1),
    ),
  access: "staff",
  async execute({ interaction, services }) {
    if (!interaction.inCachedGuild()) return;
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason");
    const duration = interaction.options.getInteger("duration");

    const parsed = blockInputSchema.safeParse({
      userId: user.id,
      reason: reason ?? undefined,
      durationMinutes: duration ?? undefined,
    });
    if (!parsed.success) {
      await interaction.reply({
        content: `❌ ${parsed.error.issues[0]?.message}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const expiresAt = duration ? new Date(Date.now() + duration * 60_000) : null;

    await services.db
      .insert(schema.blockedUsers)
      .values({
        guildId: interaction.guildId,
        userId: user.id,
        reason,
        blockedById: interaction.user.id,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [schema.blockedUsers.guildId, schema.blockedUsers.userId],
        set: { reason, expiresAt, blockedById: interaction.user.id },
      });

    await interaction.reply({
      content: duration
        ? `✅ Blocked <@${user.id}> for ${duration} minute(s).`
        : `✅ Blocked <@${user.id}>.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
