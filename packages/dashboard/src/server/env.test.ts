import { expect, test } from "bun:test";
import { envSchema } from "./env-schema.ts";

const base = {
  DATABASE_URL: "postgres://x",
  DISCORD_CLIENT_ID: "1",
  DISCORD_CLIENT_SECRET: "s",
  BETTER_AUTH_SECRET: "b".repeat(32),
  INTERNAL_API_SECRET: "a".repeat(32),
};

test("development falls back to a localhost auth url", () => {
  const env = envSchema.parse({ ...base, NODE_ENV: "development" });
  expect(env.BETTER_AUTH_URL).toBe("http://localhost:3000");
});

test("production rejects a missing BETTER_AUTH_URL", () => {
  const res = envSchema.safeParse({ ...base, NODE_ENV: "production" });
  expect(res.success).toBe(false);
  expect(JSON.stringify(res.error?.issues)).toContain("BETTER_AUTH_URL");
});

test("production rejects a localhost BETTER_AUTH_URL", () => {
  const res = envSchema.safeParse({
    ...base,
    NODE_ENV: "production",
    BETTER_AUTH_URL: "http://localhost:3000",
  });
  expect(res.success).toBe(false);
});

test("production accepts a real BETTER_AUTH_URL", () => {
  const res = envSchema.safeParse({
    ...base,
    NODE_ENV: "production",
    BETTER_AUTH_URL: "https://modmail.example.com",
  });
  expect(res.success).toBe(true);
});

test("a short INTERNAL_API_SECRET is rejected", () => {
  const res = envSchema.safeParse({ ...base, INTERNAL_API_SECRET: "tooshort" });
  expect(res.success).toBe(false);
});
