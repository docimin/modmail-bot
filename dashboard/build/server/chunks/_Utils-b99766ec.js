import { d as db } from "./db-27ceeaba.js";
import { c as config } from "./config-3e06af2b.js";
async function isUserAuthorized(userId) {
  if (!userId || !Number.isInteger(parseInt(userId)))
    return false;
  if (config.managerUserIds.includes(userId))
    return true;
  let result = await new Promise((resolve, reject) => db.query(`SELECT * FROM authorized WHERE id = ? AND type = "user"`, [userId], (err, result2) => err ? reject(err) : resolve(result2))).catch((err) => {
    console.log(err);
    return null;
  });
  if ((result == null ? void 0 : result.length) > 0)
    return true;
  let fetchResult = await fetch(`https://discord.com/api/v10/guilds/${config.sub.guildId}/members/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bot ${config.discord.token}`
    }
  });
  if (fetchResult.status !== 200)
    return false;
  let member = await fetchResult.json();
  let foundRoles = await new Promise((resolve, reject) => db.query(`SELECT * FROM authorized WHERE FIND_IN_SET(id, ?) > 0`, [member.roles.join(",")], (err, result2) => err ? reject(err) : resolve(result2))).catch((err) => {
    console.log(err);
    return null;
  });
  if (foundRoles)
    return foundRoles.length > 0;
  return false;
}
export { isUserAuthorized as i };
