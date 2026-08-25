import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
// repo root .env (packages/bot/src -> ../../../.env)
config({ path: join(here, "..", "..", "..", ".env") });

const schema = z
  .object({
    NODE_ENV: z.string().default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DISCORD_BOT_TOKEN: z.string().min(1, "DISCORD_BOT_TOKEN is required"),
    DISCORD_CLIENT_ID: z.string().min(1, "DISCORD_CLIENT_ID is required"),
    INTERNAL_API_PORT: z.coerce.number().int().default(4000),
    INTERNAL_API_HOST: z.string().default("127.0.0.1"),
    INTERNAL_API_SECRET: z.string().min(32, "INTERNAL_API_SECRET must be at least 32 characters"),
    DASHBOARD_URL: z.string().default("http://localhost:3000"),
  })
  .superRefine((env, ctx) => {
    // links in embeds point users here, so a leftover localhost value is broken in production
    if (env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/.test(env.DASHBOARD_URL)) {
      ctx.addIssue({
        code: "custom",
        path: ["DASHBOARD_URL"],
        message: "DASHBOARD_URL must be the public dashboard URL in production",
      });
    }
  });

export const env = schema.parse(process.env);
export const isDev = env.NODE_ENV !== "production";
