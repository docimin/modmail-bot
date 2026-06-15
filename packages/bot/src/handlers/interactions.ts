import {
  MessageFlags,
  type Interaction,
  type ChatInputCommandInteraction,
  type GuildMember,
} from "discord.js";
import type { Services, CommandContext } from "../framework.ts";
import { memberAccess } from "../lib/access.ts";
import { handleComponent, handleModal } from "./components.ts";

export async function handleInteraction(
  interaction: Interaction,
  services: Services,
): Promise<void> {
  try {
    if (interaction.isChatInputCommand())
      return await handleCommand(interaction, services);
    if (interaction.isAutocomplete()) {
      const cmd = services.commands.get(interaction.commandName);
      if (cmd?.autocomplete) await cmd.autocomplete(interaction, services);
      return;
    }
    if (interaction.isMessageComponent())
      return await handleComponent(interaction, services);
    if (interaction.isModalSubmit())
      return await handleModal(interaction, services);
  } catch (err) {
    services.logger.error({ err }, "interaction handler error");
  }
}

async function handleCommand(
  interaction: ChatInputCommandInteraction,
  services: Services,
): Promise<void> {
  const command = services.commands.get(interaction.commandName);
  if (!command) return;

  if (!interaction.inCachedGuild()) {
    await replyError(interaction, "This command can only be used in a server.");
    return;
  }

  const settings = await services.settings.ensure(interaction.guildId, {
    name: interaction.guild.name,
    icon: interaction.guild.icon,
    ownerId: interaction.guild.ownerId,
  });

  const member = interaction.member as GuildMember;
  const access = memberAccess(member, settings);
  const required = command.access ?? "staff";

  if (required === "staff" && !access.isStaff) {
    await replyError(interaction, "This command is staff-only.");
    return;
  }
  if (required === "admin" && !access.isAdmin) {
    await replyError(interaction, "This command is admin-only.");
    return;
  }

  const ticket =
    (await services.tickets.findOpenByChannel(interaction.channelId)) ?? null;

  if (command.inTicketOnly && !ticket) {
    await replyError(interaction, "Use this inside a ticket channel.");
    return;
  }

  const ctx: CommandContext = { interaction, services, settings, access, ticket };

  try {
    await command.execute(ctx);
  } catch (err) {
    services.logger.error({ err, command: interaction.commandName }, "command failed");
    await replyError(interaction, "Something went wrong running that command.");
  }
}

async function replyError(
  interaction: ChatInputCommandInteraction,
  content: string,
): Promise<void> {
  const payload = { content, flags: MessageFlags.Ephemeral as const };
  if (interaction.replied || interaction.deferred)
    await interaction.followUp(payload).catch(() => null);
  else await interaction.reply(payload).catch(() => null);
}
