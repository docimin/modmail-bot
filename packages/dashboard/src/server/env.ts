import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { z } from "zod";

// server-only: loads the monorepo root .env (packages/dashboard/src/server -> ../../../../.env)
const here = dirname(fileURLToPath(import.meta.url));
config({ path: join(here, "..", "..", "..", "..", ".env") });

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_CLIENT_SECRET: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
  BOT_API_URL: z.string().default("http://localhost:4000"),
  BOT_API_SECRET: z.string().default("change-me"),
  DISCORD_CLIENT_ID_PUBLIC: z.string().optional(),
  DISCORD_INVITE_URL: z.string().optional(),
  SUPPORT_SERVER_URL: z.string().optional(),
});

export const env = schema.parse(process.env);
