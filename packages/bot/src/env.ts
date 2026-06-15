import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
// repo root .env (packages/bot/src -> ../../../.env)
config({ path: join(here, "..", "..", "..", ".env") });

const schema = z.object({
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DISCORD_BOT_TOKEN: z.string().min(1, "DISCORD_BOT_TOKEN is required"),
  DISCORD_CLIENT_ID: z.string().min(1, "DISCORD_CLIENT_ID is required"),
  INTERNAL_API_PORT: z.coerce.number().int().default(4000),
  INTERNAL_API_SECRET: z.string().min(1, "INTERNAL_API_SECRET is required"),
  DASHBOARD_URL: z.string().default("http://localhost:3000"),
});

export const env = schema.parse(process.env);
export const isDev = env.NODE_ENV !== "production";
