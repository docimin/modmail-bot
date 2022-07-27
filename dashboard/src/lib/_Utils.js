// private utils, do not expose

import db from "$lib/db.js";

export async function isUserAuthorized(userId) {

 if (!userId || !Number.isInteger(parseInt(userId)))
  return false;

 if (process.env?.MANAGER_USER_IDS?.split?.(",")?.includes?.(userId))
  return true;

 let result = await new Promise((resolve, reject) => db.query(`SELECT * FROM authorized WHERE id = ? AND type = "user"`, [userId], (err, result) => err ? reject(err) : resolve(result))).catch((err) => { console.log(err); return null });
 if (result?.length > 0)
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

 // check if member has any roles in db

 let foundRoles = await new Promise((resolve, reject) => db.query(`SELECT * FROM authorized WHERE FIND_IN_SET(id, ?) > 0`, [member.roles.join(",")], (err, result) => err ? reject(err) : resolve(result))).catch((err) => { console.log(err); return null });

 if (foundRoles)
  return foundRoles.length > 0;

 return false;


}