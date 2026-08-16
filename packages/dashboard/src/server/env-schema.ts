import { z } from "zod";

export const envSchema = z
  .object({
    NODE_ENV: z.string().default("development"),
    DATABASE_URL: z.string().min(1),
    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
    BETTER_AUTH_URL: z.string().optional(),
    BOT_API_URL: z.string().default("http://localhost:4000"),
    INTERNAL_API_SECRET: z.string().min(32, "INTERNAL_API_SECRET must be at least 32 characters"),
    DISCORD_CLIENT_ID_PUBLIC: z.string().optional(),
    DISCORD_INVITE_URL: z.string().optional(),
    SUPPORT_SERVER_URL: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    // a localhost callback silently breaks Discord OAuth in production, so fail at boot instead
    if (env.NODE_ENV !== "production") return;
    if (!env.BETTER_AUTH_URL || /localhost|127\.0\.0\.1/.test(env.BETTER_AUTH_URL)) {
      ctx.addIssue({
        code: "custom",
        path: ["BETTER_AUTH_URL"],
        message: "BETTER_AUTH_URL must be set to the public dashboard URL in production",
      });
    }
  })
  .transform((env) => ({
    ...env,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL ?? "http://localhost:3000",
  }));
