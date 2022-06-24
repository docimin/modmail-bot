import { c as config } from "../../../../chunks/config-3e06af2b.js";
import cookie from "cookie";
import { d as db } from "../../../../chunks/db-27ceeaba.js";
import { v4 } from "uuid";
import { i as isUserAuthorized } from "../../../../chunks/_Utils-b99766ec.js";
import "fs";
import "mysql2";
async function get(event) {
  if (event.locals.userData)
    return {
      status: 307,
      headers: {
        Location: "/"
      }
    };
  let code = event.url.searchParams.get("code");
  if (code) {
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
      accessTokenResult = await accessTokenResult.json().catch(() => null);
      if (accessTokenResult == null ? void 0 : accessTokenResult.access_token) {
        let fetchResult = await fetch("https://discord.com/api/v10/users/@me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessTokenResult == null ? void 0 : accessTokenResult.access_token}`
          }
        });
        if (fetchResult.status !== 200)
          return {
            status: 307,
            headers: {
              "Location": "/"
            }
          };
        let fetchResultJSON = await fetchResult.json();
        let userAuthorized = await isUserAuthorized(fetchResultJSON.id);
        if (!userAuthorized)
          return {
            status: 307,
            headers: {
              "Location": "/"
            }
          };
        let cookieId = v4();
        await new Promise((resolve, reject) => db.query(`INSERT INTO sessions (id, access_token, refresh_token) VALUES (?, ?, ?)`, [cookieId, accessTokenResult.access_token, accessTokenResult.refresh_token], (err) => err ? reject(err) : resolve()));
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
        };
      }
    }
  }
  return {
    status: 307,
    headers: {
      Location: `https://discord.com/api/oauth2/authorize?client_id=${config.discord.id}&prompt=none&redirect_uri=${config.host}%2Fapi%2Fv1%2Flogin&response_type=code&scope=identify`
    }
  };
}
export { get };
