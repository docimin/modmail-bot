require("dotenv").config();

const Core = require("core");

let dClient = Core.data.discordClient;

dClient.once("ready", async () => {

 console.log(`Logged in as ${dClient.user.tag}`);

 await Core.tickets.load();

 Core.startSystems([
  "presence",
  "commands",
  "dmhandler",
  "componenthandler"
 ]);

});

dClient.login(process.env.DISCORD_TOKEN);