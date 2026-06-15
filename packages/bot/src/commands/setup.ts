import { SlashCommandBuilder, MessageFlags, EmbedBuilder } from "discord.js";
import { eq, schema } from "@modmail/db";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Configure modmail for this server")
    .addSubcommand((s) => s.setName("status").setDescription("Show the current configuration"))
    .addSubcommand((s) => s.setName("enable").setDescription("Enable modmail"))
    .addSubcommand((s) => s.setName("disable").setDescription("Disable modmail"))
    .addSubcommand((s) =>
      s
        .setName("mode")
        .setDescription("Set how tickets are created")
        .addStringOption((o) =>
          o
            .setName("mode")
            .setDescription("Ticket mode")
            .setRequired(true)
            .addChoices({ name: "threads", value: "threads" }, { name: "channels", value: "channels" }),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("inbox")
        .setDescription("Set the inbox channel")
        .addChannelOption((o) => o.setName("channel").setDescription("Inbox channel").setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName("logs")
        .setDescription("Set the log channel")
        .addChannelOption((o) => o.setName("channel").setDescription("Log channel").setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName("addstaff")
        .setDescription("Add a staff role")
        .addRoleOption((o) => o.setName("role").setDescription("Staff role").setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName("removestaff")
        .setDescription("Remove a staff role")
        .addRoleOption((o) => o.setName("role").setDescription("Staff role").setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName("addadmin")
        .setDescription("Add an admin role")
        .addRoleOption((o) => o.setName("role").setDescription("Admin role").setRequired(true)),
    )
    .addSubcommand((s) =>
      s
        .setName("removeadmin")
        .setDescription("Remove an admin role")
        .addRoleOption((o) => o.setName("role").setDescription("Admin role").setRequired(true)),
    ),
  access: "admin",
  async execute({ interaction, services, settings }) {
    if (!interaction.inCachedGuild()) return;
    const guildId = interaction.guildId;
    const sub = interaction.options.getSubcommand();
    const db = services.db;

    if (sub === "status") {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("Modmail configuration")
        .addFields(
          { name: "Enabled", value: settings.enabled ? "✅ Yes" : "❌ No", inline: true },
          { name: "Mode", value: settings.mode, inline: true },
          { name: "Setup completed", value: settings.setupCompleted ? "✅ Yes" : "❌ No", inline: true },
          { name: "Inbox", value: settings.inboxChannelId ? `<#${settings.inboxChannelId}>` : "—", inline: true },
          { name: "Log", value: settings.logChannelId ? `<#${settings.logChannelId}>` : "—", inline: true },
          {
            name: "Staff roles",
            value: settings.staffRoleIds.length ? settings.staffRoleIds.map((r) => `<@&${r}>`).join(" ") : "—",
          },
          {
            name: "Admin roles",
            value: settings.adminRoleIds.length ? settings.adminRoleIds.map((r) => `<@&${r}>`).join(" ") : "—",
          },
        );
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    if (sub === "enable" || sub === "disable") {
      const enabled = sub === "enable";
      await db
        .update(schema.guildSettings)
        .set({ enabled, updatedAt: new Date() })
        .where(eq(schema.guildSettings.guildId, guildId));
      services.settings.invalidate(guildId);
      await interaction.reply({
        content: enabled ? "✅ Modmail enabled." : "❌ Modmail disabled.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (sub === "mode") {
      const mode = interaction.options.getString("mode", true) as "threads" | "channels";
      await db
        .update(schema.guildSettings)
        .set({ mode, updatedAt: new Date() })
        .where(eq(schema.guildSettings.guildId, guildId));
      services.settings.invalidate(guildId);
      await interaction.reply({ content: `✅ Mode set to \`${mode}\`.`, flags: MessageFlags.Ephemeral });
      return;
    }

    if (sub === "inbox") {
      const channelId = interaction.options.getChannel("channel", true).id;
      await db
        .update(schema.guildSettings)
        .set({ inboxChannelId: channelId, setupCompleted: true, updatedAt: new Date() })
        .where(eq(schema.guildSettings.guildId, guildId));
      services.settings.invalidate(guildId);
      await interaction.reply({ content: `✅ Inbox set to <#${channelId}>.`, flags: MessageFlags.Ephemeral });
      return;
    }

    if (sub === "logs") {
      const channelId = interaction.options.getChannel("channel", true).id;
      await db
        .update(schema.guildSettings)
        .set({ logChannelId: channelId, updatedAt: new Date() })
        .where(eq(schema.guildSettings.guildId, guildId));
      services.settings.invalidate(guildId);
      await interaction.reply({ content: `✅ Log channel set to <#${channelId}>.`, flags: MessageFlags.Ephemeral });
      return;
    }

    const roleId = interaction.options.getRole("role", true).id;
    const isStaff = sub === "addstaff" || sub === "removestaff";
    const list = isStaff ? settings.staffRoleIds : settings.adminRoleIds;
    const isAdd = sub === "addstaff" || sub === "addadmin";
    const label = isStaff ? "staff" : "admin";

    if (isAdd && list.includes(roleId)) {
      await interaction.reply({
        content: `❌ <@&${roleId}> is already a ${label} role.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    if (!isAdd && !list.includes(roleId)) {
      await interaction.reply({
        content: `❌ <@&${roleId}> is not a ${label} role.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const next = isAdd ? [...list, roleId] : list.filter((r) => r !== roleId);
    await db
      .update(schema.guildSettings)
      .set(isStaff ? { staffRoleIds: next, updatedAt: new Date() } : { adminRoleIds: next, updatedAt: new Date() })
      .where(eq(schema.guildSettings.guildId, guildId));
    services.settings.invalidate(guildId);
    await interaction.reply({
      content: isAdd ? `✅ Added <@&${roleId}> as ${label}.` : `🗑️ Removed <@&${roleId}> from ${label}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

export default command;
