import cookie from "cookie";
import { d as db } from "./db-27ceeaba.js";
import { c as config } from "./config-3e06af2b.js";
import { i as isUserAuthorized } from "./_Utils-b99766ec.js";
import "mysql2";
import "fs";
const sessionIdCache = /* @__PURE__ */ new Map();
const handle = async ({ event, resolve }) => {
  var _a, _b, _c;
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
  let manager = config.managerUserIds.includes(userId);
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
export { getSession, handle };
