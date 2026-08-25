import { eq, schema } from "@modmail/db";
import { ChannelType, type Client, Events, type Message } from "discord.js";
import type { Services } from "../framework.ts";
import { handleInteraction } from "../handlers/interactions.ts";

export function registerEvents(client: Client, services: Services): void {
  const { logger } = services;

  client.on(Events.InteractionCreate, (interaction) => {
    void handleInteraction(interaction, services);
  });

  client.on(Events.MessageCreate, (message) => {
    void onMessageCreate(message, services).catch((err) =>
      logger.error({ err }, "messageCreate error"),
    );
  });

  client.on(Events.MessageUpdate, (_old, message) => {
    if (message.partial) return;
    if (message.channel.type === ChannelType.DM)
      void services.dm.handleEdit(message as Message).catch(() => null);
  });

  client.on(Events.GuildCreate, (guild) => {
    void services.settings
      .ensure(guild.id, { name: guild.name, icon: guild.icon, ownerId: guild.ownerId })
      .catch((err) => logger.error({ err }, "guildCreate ensure failed"));
    logger.info({ guildId: guild.id, name: guild.name }, "joined guild");
  });

  client.on(Events.GuildDelete, (guild) => {
    void services.db
      .update(schema.guilds)
      .set({ botPresent: false, leftAt: new Date() })
      .where(eq(schema.guilds.id, guild.id))
      .catch(() => null);
    services.settings.invalidate(guild.id);
    logger.info({ guildId: guild.id }, "left guild");
  });

  client.on(Events.GuildMemberRemove, async (member) => {
    const settings = await services.settings.get(member.guild.id).catch(() => null);
    if (!settings?.config.closeOnLeave) return;
    const ticket = await services.tickets.findOpenInGuild(member.guild.id, member.id);
    const botId = client.user?.id;
    if (ticket && botId)
      await services.tickets
        .close(ticket, { byId: botId, reason: "User left the server", silent: true })
        .catch(() => null);
  });
}

async function onMessageCreate(message: Message, services: Services): Promise<void> {
  if (message.author.bot || message.webhookId) return;
  if (message.system) return;

  // DM from a user
  if (message.channel.type === ChannelType.DM) {
    await services.dm.handleDM(message);
    return;
  }

  // staff message typed inside a ticket channel = internal note
  if (!message.inGuild()) return;
  const ticket = await services.tickets.findOpenByChannel(message.channelId);
  if (!ticket) return;

  const content =
    message.content +
    (message.attachments.size
      ? `\n${[...message.attachments.values()].map((a) => a.url).join("\n")}`
      : "");
  if (!content.trim()) return;

  await services.tickets.addInternalNote(ticket, {
    authorId: message.author.id,
    authorTag: message.author.username,
    authorAvatar: message.author.displayAvatarURL(),
    content: content.trim(),
  });
}
