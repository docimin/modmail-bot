import { MessageFlags, SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../framework.ts";

const command: BotCommand = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Show bot latency"),
  access: "everyone",
  async execute({ interaction, services }) {
    const sent = Date.now();
    await interaction.reply({ content: "🕒 Pinging…", flags: MessageFlags.Ephemeral });
    const roundtrip = Date.now() - sent;
    const ws = Math.round(services.client.ws.ping);

    await interaction.editReply(`✅ Pong! Websocket: \`${ws}ms\` · Roundtrip: \`${roundtrip}ms\``);
  },
};

export default command;
