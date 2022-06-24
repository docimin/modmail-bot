var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { c as config } from "../../../../chunks/config-3e06af2b.js";
import "fs";
const userCache = /* @__PURE__ */ new Map();
function get(event) {
  return new Promise((resolve) => {
    if (!event.locals.userData)
      return resolve({
        status: 401,
        body: {
          error: "Unauthorized"
        }
      });
    let userIds = event.url.searchParams.getAll("userId") || null;
    let users = [];
    let iUserIds = 0;
    getUser();
    async function getUser() {
      let userId = userIds[iUserIds];
      if (userId) {
        let cachedUser = userCache.get(userId);
        if (((cachedUser == null ? void 0 : cachedUser.timestamp) || 0) + 6e4 * 5 < Date.now()) {
          let result = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: {
              Authorization: `Bot ${config.discord.token}`
            }
          });
          if (result.status === 200) {
            userCache.set(userId, __spreadProps(__spreadValues({}, await result.json()), {
              timestamp: Date.now()
            }));
            users.push(userCache.get(userId));
          }
        } else {
          users.push(cachedUser);
        }
      }
      iUserIds++;
      if (iUserIds >= userIds.length)
        resolve({
          status: 200,
          body: users
        });
      else
        setTimeout(getUser);
    }
  });
}
export { get };
