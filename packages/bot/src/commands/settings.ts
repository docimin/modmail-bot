import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const channel = (id: string | null) => (id ? `<#${id}>` : "—");
const roles = (ids: string[]) => (ids.length ? ids.map((r) => `<@&${r}>`).join(", ") : "—");

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Show the modmail settings overview"),
  access: "admin",
  async execute({ interaction, settings }) {
    const c = settings.config;
    const baseUrl = process.env.DASHBOARD_URL ?? "";

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("⚙️ Modmail Settings")
      .addFields(
        { name: "Enabled", value: settings.enabled ? "✅ Yes" : "❌ No", inline: true },
        { name: "Mode", value: settings.mode, inline: true },
        { name: "Inbox", value: channel(settings.inboxChannelId), inline: true },
        { name: "Log", value: channel(settings.logChannelId), inline: true },
        { name: "Staff roles", value: roles(settings.staffRoleIds), inline: false },
        { name: "Admin roles", value: roles(settings.adminRoleIds), inline: false },
        {
          name: "Anonymous replies",
          value: c.anonymousByDefault ? "✅ On by default" : "❌ Off by default",
          inline: true,
        },
        {
          name: "Auto-close",
          value: c.autoCloseEnabled ? `🕒 After ${c.autoCloseAfterMinutes} min` : "❌ Off",
          inline: true,
        },
        {
          name: "Cooldown",
          value: c.cooldownSeconds > 0 ? `${c.cooldownSeconds}s` : "None",
          inline: true,
        },
      )
      .setDescription(
        `[Open the dashboard](${baseUrl}/dashboard/${settings.guildId}/settings) for full configuration.`,
      );

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
