const Discord = require("discord.js");

let discordClient = new Discord.Client({
 restGlobalRateLimit: 40,
 intents: [
  Discord.Intents.FLAGS.GUILDS,
  Discord.Intents.FLAGS.GUILD_MEMBERS,
  Discord.Intents.FLAGS.GUILD_BANS,
  Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
  Discord.Intents.FLAGS.GUILD_WEBHOOKS,
  Discord.Intents.FLAGS.GUILD_INVITES,
  Discord.Intents.FLAGS.GUILD_VOICE_STATES,
  Discord.Intents.FLAGS.GUILD_PRESENCES,
  Discord.Intents.FLAGS.GUILD_MESSAGES,
  Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
  Discord.Intents.FLAGS.DIRECT_MESSAGES,
  Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  Discord.Intents.FLAGS.GUILD_SCHEDULED_EVENTS
 ],
 partials: ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"],
 failIfNotExists: false
}),
    config        = require("../assets/config.json"),
    gConfig       = require("../../config.json");

class Core {

 static data = {
  discordClient,
  config,
  gConfig
 }

 static tickets = require("./TicketsManager");
 static messages = require("./MessagesManager");
 static database = require("./DatabaseManager");
 static utils = require("./Utils");

 /**
  * Starts the given systems.
  * @param {Array<String>} systemNames System names to start
  * @returns {Promise<>} Resolves when all systems are started
  */
 static startSystems(systemNames = []) {

  return new Promise((resolve) => {

   console.log("Starting", systemNames.length, "systems ...");
   let startTimestamp = Date.now();

   let iSystems = 0;

   startSystem();

   async function startSystem() {

    let systemName = systemNames[iSystems];

    if (systemName) {

     process.stdout.write(`[${systemName}] Starting ... `);
     let startTimestampSystem = Date.now();

     try {

      let system = require(`../systems/${systemName}.js`);

      await system.run();

      process.stdout.write(`DONE - Took ${(Date.now()-startTimestampSystem)/1000}s\n`);

     } catch (err) {

      process.stdout.write("ERROR\n");
      console.log("Error when starting", systemName);
      console.log(err);

     }

    }

    iSystems++;
    if (iSystems < systemNames.length)
     startSystem();
    else {
     console.log(`All systems started - Took ${(Date.now()-startTimestamp)/1000}s`);
     resolve();
    }

   }

   Core.tickets.handleModals();

  });

 }

}

module.exports = Core;