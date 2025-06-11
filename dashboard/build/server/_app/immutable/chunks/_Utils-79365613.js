import { d as db } from "./db-90aa6d88.js";
async function isUserAuthorized(userId) {
  var _a, _b, _c, _d, _e;
  if (!userId || !Number.isInteger(parseInt(userId)))
    return false;
  if ((_e = (_d = (_c = (_b = (_a = process.env) == null ? void 0 : _a.MANAGER_USER_IDS) == null ? void 0 : _b.split) == null ? void 0 : _c.call(_b, ",")) == null ? void 0 : _d.includes) == null ? void 0 : _e.call(_d, userId))
    return true;
  let result = await new Promise((resolve, reject) => db.query(`SELECT * FROM authorized WHERE id = ? AND type = "user"`, [userId], (err, result2) => err ? reject(err) : resolve(result2))).catch((err) => {
    console.log(err);
    return null;
  });
  if ((result == null ? void 0 : result.length) > 0)
    return true;
  let fetchResult = await fetch(`https://discord.com/api/v10/guilds/${process.env.GUILD_ID}/members/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`
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
export {
  isUserAuthorized as i
};
