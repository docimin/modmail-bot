import cookie from "cookie";
import db from "$lib/db.js";
import config from "$lib/config.js";
import * as _utils from "$lib/_Utils.js";

const sessionIdCache = new Map(); // key: session_id; value: { userData, timestamp }

export const handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get("cookie") || "");

 if (cookies.session_id) {

  event.locals.sessionId = cookies.session_id;

  if ((sessionIdCache.get(cookies.session_id)?.timestamp || 0) > Date.now()) {

   event.locals.userData = sessionIdCache.get(cookies.session_id)?.userData;

  } else {

   let userData = await new Promise((resolve) => db.query("SELECT access_token FROM sessions WHERE id = ? LIMIT 1", [cookies.session_id], async (err, result) => {

    if (err)
     return resolve(null);

    let accessToken = result[0]?.access_token;

    if (!accessToken)
     return resolve(null);

    let fetchResult = await fetch("https://discord.com/api/v10/users/@me", {
     method: "GET",
     headers: {
      Authorization: `Bearer ${accessToken}`
     }
    });

    if (fetchResult.status !== 200)
     return resolve(null);

    let fetchResultJSON = await fetchResult.json();

    sessionIdCache.set(cookies.session_id, {
     userData: fetchResultJSON,
     timestamp: Date.now() + 30000
    });

    resolve(fetchResultJSON);

   }));

   if (userData)
    event.locals.userData = userData;

  }

 }

 let userId = event.locals.userData?.id;
 let manager = config.managerUserIds.includes(userId);

 if (userId && !manager) {
  let userAuthorized = await _utils.isUserAuthorized(userId);
  if (!userAuthorized) {
   event.locals.userData = null;
   manager = null;
   await new Promise((resolve, reject) => db.query(`DELETE FROM sessions WHERE id = ?`, [cookies.session_id], (err, result) => err ? reject(err) : resolve(result)));
  }
 }

 if (manager)
  event.locals.userData.manager = true;

	const response = await resolve(event);

	return response;
}

export function getSession(event) {

 return {
  userData: event.locals.userData || null,
 }

}