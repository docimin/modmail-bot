import "./load-env.ts";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({ connectionString: url });
const db = drizzle(pool);

await migrate(db, { migrationsFolder: join(__dirname, "..", "drizzle") });
await pool.end();

console.log("Migrations applied.");
