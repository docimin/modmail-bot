import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Load the monorepo root .env (packages/db/src -> ../../../.env). Needed because
// bun only auto-loads .env from the cwd, and db scripts run with cwd = packages/db.
// dotenv does not override vars already present in the environment.
const here = dirname(fileURLToPath(import.meta.url));
config({ path: join(here, "..", "..", "..", ".env") });
