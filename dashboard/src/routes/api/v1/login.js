import config from "$lib/config.js";
import cookie from "cookie";
import db from "$lib/db.js";
import { v4 as uuid } from "uuid";
import * as _utils from "$lib/_Utils.js";

export async function GET(event) {

 console.log("[login.js]", 1, "Processing login request ...");
 
 if (event.locals.userData)
  return {
   status: 307,
   headers: {
    Location: "/"
   }
  }

 let code = event.url.searchParams.get("code");

 if (code) {

  console.log("[login.js]", 2, "Detected redirect from Discord");
  
  let accessTokenResult = await fetch("https://discord.com/api/oauth2/token", {
   method: "POST",
   body: new URLSearchParams({
    client_id: config.discord.id,
    client_secret: config.discord.secret,
    grant_type: "authorization_code",
    code,
    redirect_uri: `${config.host}/api/v1/login`
   })
  });
 
  if (accessTokenResult.status === 200) {
 
   console.log("[login.js]", 3, "Successfully fetched access token");
   
   accessTokenResult = await accessTokenResult.json().catch(() => null);
  
   if (accessTokenResult?.access_token) {

    let fetchResult = await fetch("https://discord.com/api/v10/users/@me", {
     method: "GET",
     headers: {
      Authorization: `Bearer ${accessTokenResult?.access_token}`
     }
    });

    console.log("[login.js]", 4, "User info result:", fetchResult.status);

    if (fetchResult.status !== 200)
     return {
      status: 307,
      headers: {
       "Location": "/"
      }
     }

    let fetchResultJSON = await fetchResult.json();

    let userAuthorized = await _utils.isUserAuthorized(fetchResultJSON.id);

    console.log("[login.js]", 5, "User authorized:", userAuthorized);

    if (!userAuthorized)
     return {
      status: 307,
      headers: {
       "Location": "/"
      }
     }

    let cookieId = uuid();

    console.log("[login.js]", 6, "Writing to db ...");

    await new Promise((resolve, reject) => db.query(`INSERT INTO sessions (id, access_token, refresh_token) VALUES (?, ?, ?)`, [cookieId, accessTokenResult.access_token, accessTokenResult.refresh_token], (err) => err ? reject(err) : resolve()));

    console.log("[login.js]", 7, "Returning to / with cookies");

    return {
     status: 307,
     headers: {
      "Set-Cookie": cookie.serialize("session_id", cookieId, {
       httpOnly: true,
       maxAge: 60 * 60 * 24 * 5,
       sameSite: "lax",
       path: "/"
      }),
      "Location": "/"
     },
     body: "Redirecting..."
    }

   } else console.log("[login.js]", 4, "No access token found");

  } else console.log("[login.js]", 3, "Invalid access token result:", accessTokenResult.status, await accessTokenResult.json().catch(() => null));
 
 }

 return {
  status: 307,
  headers: {
   Location: `https://discord.com/api/oauth2/authorize?client_id=${config.discord.id}&prompt=none&redirect_uri=${config.host}%2Fapi%2Fv1%2Flogin&response_type=code&scope=identify`
  }
 }

}