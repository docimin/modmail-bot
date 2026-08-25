import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { envSchema } from "./env-schema.ts";

// server-only: loads the monorepo root .env (packages/dashboard/src/server -> ../../../../.env)
const here = dirname(fileURLToPath(import.meta.url));
config({ path: join(here, "..", "..", "..", "..", ".env") });

export const env = envSchema.parse(process.env);
