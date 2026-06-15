import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.ts";

export type Database = ReturnType<typeof createDb>;

export function createDb(connectionString: string) {
  const pool = new Pool({ connectionString, max: 10 });
  return drizzle(pool, { schema, casing: "snake_case" });
}

let _db: Database | undefined;

// Lazily-created singleton bound to DATABASE_URL. Both the bot and the
// dashboard share this so connection pools aren't duplicated per import.
export function getDb(): Database {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  _db = createDb(url);
  return _db;
}
