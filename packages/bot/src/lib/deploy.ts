import { REST, Routes } from "discord.js";
import type { BotCommand } from "../framework.ts";

export async function deployCommands(
  commands: Map<string, BotCommand>,
  opts: { token: string; clientId: string; guildId?: string },
): Promise<number> {
  const body = [...commands.values()].map((c) => c.data.toJSON());
  const rest = new REST().setToken(opts.token);
  const route = opts.guildId
    ? Routes.applicationGuildCommands(opts.clientId, opts.guildId)
    : Routes.applicationCommands(opts.clientId);
  await rest.put(route, { body });
  return body.length;
}
