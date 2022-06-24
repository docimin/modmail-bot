const Core = require("core");

let { discordClient: dClient, config } = Core.data;

exports.run = async () => {

 await dClient.user.setPresence(config.presence);

 setInterval(() => {
  dClient.user.setPresence(config.presence);
 }, 5 * 60 * 1000);

}