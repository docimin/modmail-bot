import { d as db } from "../../../../chunks/db-27ceeaba.js";
import "mysql2";
import "../../../../chunks/config-3e06af2b.js";
import "fs";
async function get(event) {
  if (!event.locals.userData)
    return {
      status: 401,
      body: {
        error: "Unauthorized"
      }
    };
  let start = event.url.searchParams.get("start") || 0, limit = event.url.searchParams.get("limit") || 50, filter = event.url.searchParams.get("filter") || null, ticketId = event.url.searchParams.get("ticketId") || null;
  try {
    let result = await new Promise((resolve, reject) => db.query(`SELECT * FROM tickets${ticketId ? " WHERE id = ?" : filter ? " WHERE id = ? OR userId = ? OR reason LIKE ? OR comment LIKE ? OR messages LIKE ?" : ""} LIMIT ${parseInt(start)}, ${parseInt(limit)}`, ticketId ? [ticketId] : [filter, filter, `%${filter}%`, `%${filter}%`, `%${filter}%`], (err, result2) => err ? reject(err) : resolve(result2)));
    result = result.map((t) => {
      t.attachedUsers = t.attachedUsers ? JSON.parse(t.attachedUsers) : [];
      t.messages = t.messages ? JSON.parse(t.messages) : [];
      t.notifyUserIds = t.notifyUserIds ? JSON.parse(t.notifyUserIds) : [];
      return t;
    });
    result = result.sort((a, b) => a.createdTimestamp > b.createdTimestamp ? -1 : 1);
    return {
      status: 200,
      body: result
    };
  } catch (err) {
    return {
      status: 409,
      body: {
        error: err.message
      }
    };
  }
}
export { get };
