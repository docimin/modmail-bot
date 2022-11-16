import * as dotenv from "dotenv";
import cookie from "cookie";
import { d as db } from "./db-085607c7.js";
import { i as isUserAuthorized } from "./_Utils-8d5495f2.js";
import "mysql2";
dotenv.config();
const sessionIdCache = /* @__PURE__ */ new Map();
const handle = async ({ event, resolve }) => {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const cookies = cookie.parse(event.request.headers.get("cookie") || "");
  if (cookies.session_id) {
    event.locals.sessionId = cookies.session_id;
    if ((((_a = sessionIdCache.get(cookies.session_id)) == null ? void 0 : _a.timestamp) || 0) > Date.now()) {
      event.locals.userData = (_b = sessionIdCache.get(cookies.session_id)) == null ? void 0 : _b.userData;
    } else {
      let userData = await new Promise((resolve2) => db.query("SELECT access_token FROM sessions WHERE id = ? LIMIT 1", [cookies.session_id], async (err, result) => {
        var _a2;
        if (err)
          return resolve2(null);
        let accessToken = (_a2 = result[0]) == null ? void 0 : _a2.access_token;
        if (!accessToken)
          return resolve2(null);
        let fetchResult = await fetch("https://discord.com/api/v10/users/@me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        if (fetchResult.status !== 200)
          return resolve2(null);
        let fetchResultJSON = await fetchResult.json();
        sessionIdCache.set(cookies.session_id, {
          userData: fetchResultJSON,
          timestamp: Date.now() + 3e4
        });
        resolve2(fetchResultJSON);
      }));
      if (userData)
        event.locals.userData = userData;
    }
  }
  let userId = (_c = event.locals.userData) == null ? void 0 : _c.id;
  let manager = (_h = (_g = (_f = (_e = (_d = process.env) == null ? void 0 : _d.MANAGER_USER_IDS) == null ? void 0 : _e.split) == null ? void 0 : _f.call(_e, ",")) == null ? void 0 : _g.includes) == null ? void 0 : _h.call(_g, userId);
  if (userId && !manager) {
    let userAuthorized = await isUserAuthorized(userId);
    if (!userAuthorized) {
      event.locals.userData = null;
      manager = null;
      await new Promise((resolve2, reject) => db.query(`DELETE FROM sessions WHERE id = ?`, [cookies.session_id], (err, result) => err ? reject(err) : resolve2(result)));
    }
  }
  if (manager)
    event.locals.userData.manager = true;
  const response = await resolve(event);
  return response;
};
function getSession(event) {
  return {
    userData: event.locals.userData || null
  };
}
export {
  getSession,
  handle
};
