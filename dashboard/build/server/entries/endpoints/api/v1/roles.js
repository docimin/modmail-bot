import { c as config } from "../../../../chunks/config-3e06af2b.js";
import "fs";
async function get(event) {
  var _a;
  if (!((_a = event.locals.userData) == null ? void 0 : _a.manager))
    return resolve({
      status: 401,
      body: {
        error: "Unauthorized"
      }
    });
  let result = await fetch(`https://discord.com/api/v10/guilds/${config.sub.guildId}/roles`, {
    headers: {
      Authorization: `Bot ${config.discord.token}`
    }
  });
  let roles = [];
  if (result.status === 200)
    roles = (await result.json()).map((r) => {
      return {
        id: r.id,
        name: r.name,
        color: r.color ? `#${r.color.toString(16).padStart(6, "0")}` : null
      };
    });
  return {
    status: 200,
    body: roles
  };
}
export { get };
