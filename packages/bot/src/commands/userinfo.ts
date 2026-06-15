import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from "discord.js";
import { and, count, eq, schema } from "@modmail/db";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Show information about a user")
    .addUserOption((o) =>
      o.setName("user").setDescription("The user to look up").setRequired(true),
    ),
  access: "staff",
  async execute({ interaction, services }) {
    if (!interaction.inCachedGuild()) return;
    const user = interaction.options.getUser("user", true);
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const [ticketRow] = await services.db
      .select({ value: count() })
      .from(schema.tickets)
      .where(
        and(
          eq(schema.tickets.guildId, interaction.guildId),
          eq(schema.tickets.userId, user.id),
        ),
      );
    const ticketCount = ticketRow?.value ?? 0;

    const roles = member
      ? [...member.roles.cache.values()]
          .filter((r) => r.id !== interaction.guildId)
          .map((r) => `<@&${r.id}>`)
          .join(" ")
      : "";

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: "ID", value: `\`${user.id}\``, inline: false },
        {
          name: "Account created",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          inline: true,
        },
        {
          name: "Joined",
          value: member?.joinedTimestamp
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
            : "Not a member",
          inline: true,
        },
        { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
        { name: "Tickets", value: `${ticketCount}`, inline: true },
        { name: "Roles", value: roles || "None", inline: false },
      );

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
