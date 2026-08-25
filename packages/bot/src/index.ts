import { closeDb } from "@modmail/db";
import { Events } from "discord.js";
import { startApi } from "./api/start.ts";
import { createClient } from "./client.ts";
import { loadCommands } from "./commands/loader.ts";
import { db } from "./db.ts";
import { env } from "./env.ts";
import { registerEvents } from "./events/index.ts";
import type { Services } from "./framework.ts";
import { deployCommands } from "./lib/deploy.ts";
import { logger } from "./logger.ts";
import { DMRouter } from "./modmail/DMRouter.ts";
import { TicketService } from "./modmail/TicketService.ts";
import { startScheduler } from "./scheduler/index.ts";
import { SettingsService } from "./settings/service.ts";

const client = createClient();
const settings = new SettingsService(db);
const tickets = new TicketService(client, db, settings, logger);
const dm = new DMRouter(client, db, settings, tickets, logger);
const commands = await loadCommands();

const services: Services = { client, db, logger, settings, tickets, dm, commands };

registerEvents(client, services);

client.once(Events.ClientReady, async (c) => {
  logger.info(`Logged in as ${c.user.tag} (${c.guilds.cache.size} guilds)`);

  try {
    const n = await deployCommands(commands, {
      token: env.DISCORD_BOT_TOKEN,
      clientId: env.DISCORD_CLIENT_ID,
    });
    logger.info(`Deployed ${n} slash commands.`);
  } catch (err) {
    logger.error({ err }, "command deployment failed");
  }

  for (const guild of c.guilds.cache.values()) {
    void settings
      .ensure(guild.id, { name: guild.name, icon: guild.icon, ownerId: guild.ownerId })
      .catch(() => null);
  }

  startScheduler(services);
});

const server = startApi(services);

await client.login(env.DISCORD_BOT_TOKEN);

let shuttingDown = false;
const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Received ${signal}, shutting down…`);

  const timer = setTimeout(() => {
    logger.error("Shutdown timed out, forcing exit");
    process.exit(1);
  }, 10_000);
  timer.unref();

  try {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await client.destroy();
    await closeDb();
  } catch (err) {
    logger.error({ err }, "Error during shutdown");
  }
  process.exit(0);
};
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
