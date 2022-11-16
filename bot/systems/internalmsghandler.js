const Core = require("core");

let { discordClient: dClient, config } = Core.data;

exports.run = async () => {

 dClient.on("messageCreate", (message) => {

  if (message.author.bot) return;

  let ticket = Core.tickets.cache.get(message.channel.name);

  if (!ticket) return;

  ticket.addMessage("INTERNAL", message, false);

 });

}