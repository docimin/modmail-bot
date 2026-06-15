import { getDb } from "@modmail/db";
import "./env.ts";

export const db = getDb();
export { schema, eq, and, or, desc, asc, sql, inArray, count, gte, lte, like, ilike } from "@modmail/db";
