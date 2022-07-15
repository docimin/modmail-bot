import db from "$lib/db.js";
import cookie from "cookie";

export async function GET(event) {

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
 }

}