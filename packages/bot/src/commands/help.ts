import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand, CommandAccess } from "../framework.ts";

const groupLabels: Record<CommandAccess, string> = {
  everyone: "Everyone",
  staff: "Staff",
  admin: "Admin",
};

const command: BotCommand = {
  data: new SlashCommandBuilder().setName("help").setDescription("List the available commands"),
  access: "everyone",
  async execute({ interaction, services }) {
    const groups: Record<CommandAccess, string[]> = {
      everyone: [],
      staff: [],
      admin: [],
    };

    for (const cmd of services.commands.values()) {
      const json = cmd.data.toJSON();
      const access = cmd.access ?? "staff";
      const description = "description" in json ? json.description : "";
      groups[access].push(`**/${json.name}** — ${description}`);
    }

    const embed = new EmbedBuilder().setColor(0x5865f2).setTitle("Commands");

    for (const access of ["everyone", "staff", "admin"] as const) {
      const lines = groups[access];
      if (lines.length) {
        embed.addFields({
          name: groupLabels[access],
          value: lines.sort().join("\n").slice(0, 1024),
        });
      }
    }

    const dashboardUrl = process.env.DASHBOARD_URL ?? "";
    if (dashboardUrl) {
      embed.addFields({ name: "Dashboard", value: dashboardUrl });
    }

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
