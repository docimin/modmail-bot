import { getDb } from "@modmail/db";
import "./env.ts";

export const db = getDb();
export {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  like,
  lte,
  or,
  schema,
  sql,
} from "@modmail/db";
