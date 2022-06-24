import { d as db } from "../../../../chunks/db-27ceeaba.js";
import cookie from "cookie";
import "mysql2";
import "../../../../chunks/config-3e06af2b.js";
import "fs";
async function get(event) {
  if (event.locals.userData)
    await new Promise((resolve) => db.query("DELETE FROM sessions WHERE id = ?", [event.locals.sessionId], () => resolve()));
  return {
    status: 307,
    headers: {
      "Set-Cookie": cookie.serialize("session_id", "_", {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 5,
        sameSite: "lax",
        path: "/"
      }),
      Location: "/"
    }
  };
}
export { get };
