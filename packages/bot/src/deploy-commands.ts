// Standalone command deployment script: `bun run bot:deploy` (optionally pass a guild id)
import { env } from "./env.ts";
import { logger } from "./logger.ts";
import { loadCommands } from "./commands/loader.ts";
import { deployCommands } from "./lib/deploy.ts";

const commands = await loadCommands();
const count = await deployCommands(commands, {
  token: env.DISCORD_BOT_TOKEN,
  clientId: env.DISCORD_CLIENT_ID,
  guildId: process.argv[2],
});
logger.info(`Deployed ${count} commands${process.argv[2] ? ` to guild ${process.argv[2]}` : " globally"}.`);
