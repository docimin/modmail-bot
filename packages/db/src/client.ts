import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.ts";

export type Database = ReturnType<typeof createDb>;

export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString, max: 10 });
  return drizzle(pool, { schema, casing: "snake_case" });
}

let _db: Database | undefined;
let _pool: Pool | undefined;

// Lazily-created singleton bound to DATABASE_URL. Both the bot and the
// dashboard share this so connection pools aren't duplicated per import.
export function getDb(): Database {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  _pool = new Pool({ connectionString: url, max: 10 });
  _db = drizzle(_pool, { schema, casing: "snake_case" });
  return _db;
}

export async function closeDb(): Promise<void> {
  await _pool?.end();
  _pool = undefined;
  _db = undefined;
}
