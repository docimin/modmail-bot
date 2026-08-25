import { type ServerType, serve } from "@hono/node-server";
import { env } from "../env.ts";
import type { Services } from "../framework.ts";
import { createApi } from "./server.ts";

export function startApi(services: Services): ServerType {
  const app = createApi(services, {
    secret: env.INTERNAL_API_SECRET,
    token: env.DISCORD_BOT_TOKEN,
    clientId: env.DISCORD_CLIENT_ID,
  });
  const server = serve(
    {
      fetch: app.fetch,
      port: env.INTERNAL_API_PORT,
      hostname: env.INTERNAL_API_HOST,
    },
    (info) => {
      services.logger.info(`Internal API listening on ${env.INTERNAL_API_HOST}:${info.port}`);
    },
  );

  // Without the API the dashboard cannot act on tickets, so a bind failure is fatal
  // rather than a bot that looks healthy but is half-connected.
  server.on("error", (err: NodeJS.ErrnoException) => {
    const target = `${env.INTERNAL_API_HOST}:${env.INTERNAL_API_PORT}`;
    if (err.code === "EADDRINUSE") {
      services.logger.error(
        `Internal API cannot bind ${target} — another bot instance is probably already running.`,
      );
    } else {
      services.logger.error({ err }, `Internal API failed on ${target}`);
    }
    process.exit(1);
  });

  return server;
}
