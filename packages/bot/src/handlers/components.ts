import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
  type MessageComponentInteraction,
  type ModalSubmitInteraction,
  type GuildMember,
} from "discord.js";
import { eq, schema } from "@modmail/db";
import type { Services } from "../framework.ts";
import { memberAccess } from "../lib/access.ts";

export async function handleComponent(
  interaction: MessageComponentInteraction,
  services: Services,
): Promise<void> {
  const id = interaction.customId;

  // ─── DM flow (in DMs) ──────────────────────────────────────────────────
  if (id === "dm:server" && interaction.isStringSelectMenu())
    return services.dm.onServerSelect(interaction, interaction.values[0]!);
  if (id === "dm:category" && interaction.isStringSelectMenu())
    return services.dm.onCategorySelect(interaction, interaction.values[0]!);
  if (id === "dm:confirm") return services.dm.onConfirm(interaction);
  if (id === "dm:cancel") return services.dm.onCancel(interaction);

  // ─── ticket quick actions (in inbox) ───────────────────────────────────
  if (id.startsWith("ticket:")) return handleTicketAction(interaction, services);
}

async function handleTicketAction(
  interaction: MessageComponentInteraction,
  services: Services,
): Promise<void> {
  if (!interaction.inCachedGuild()) return;
  const settings = await services.settings.get(interaction.guildId);
  if (!settings) return;

  const member = interaction.member as GuildMember;
  const access = memberAccess(member, settings);
  if (!access.isStaff) {
    await interaction.reply({
      content: "You don't have permission to do that.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const ticket = await services.tickets.findOpenByChannel(interaction.channelId);
  if (!ticket) {
    await interaction.reply({
      content: "This isn't an open ticket channel.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const action = interaction.customId.split(":")[1];

  switch (action) {
    case "close": {
      await interaction.reply({ content: "Closing ticket…", flags: MessageFlags.Ephemeral });
      await services.tickets.close(ticket, {
        byId: member.id,
        byTag: member.user.username,
      });
      return;
    }
    case "claim": {
      await services.db
        .update(schema.tickets)
        .set({ assignedStaffId: member.id })
        .where(eq(schema.tickets.id, ticket.id));
      await interaction.reply({ content: `Claimed by <@${member.id}>.` });
      return;
    }
    case "snippet": {
      const snippets = await services.db.query.snippets.findMany({
        where: eq(schema.snippets.guildId, interaction.guildId),
        limit: 25,
      });
      if (!snippets.length) {
        await interaction.reply({
          content: "No snippets configured. Create one with `/snippet add`.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("ticket:snippetpick")
          .setPlaceholder("Pick a snippet to send")
          .addOptions(
            snippets.map((s) => ({
              label: s.name.slice(0, 100),
              value: s.id,
              description: s.content.slice(0, 100),
            })),
          ),
      );
      await interaction.reply({ components: [row], flags: MessageFlags.Ephemeral });
      return;
    }
    case "snippetpick": {
      if (!interaction.isStringSelectMenu()) return;
      const snippet = await services.db.query.snippets.findFirst({
        where: eq(schema.snippets.id, interaction.values[0]!),
      });
      if (!snippet) {
        await interaction.update({ content: "Snippet not found.", components: [] });
        return;
      }
      const result = await services.tickets.sendStaffReply(ticket, {
        authorId: member.id,
        authorTag: member.user.username,
        authorAvatar: member.displayAvatarURL(),
        content: snippet.content,
        anonymous: settings.config.anonymousByDefault,
        snippetId: snippet.id,
      });
      await interaction.update({
        content: result.ok ? "Snippet sent." : `Failed: ${result.error}`,
        components: [],
      });
      return;
    }
  }
}

export async function handleModal(
  _interaction: ModalSubmitInteraction,
  _services: Services,
): Promise<void> {
  // reserved for future modal flows (e.g. dashboard-less setup)
}
