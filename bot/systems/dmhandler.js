const Core = require("core");

let {discordClient: dClient, config} = Core.data;

exports.run = async () => {

 dClient.on("messageCreate", (message) => {

  if (message.content.startsWith(process.env.SEND_EMBED_COMMAND) && process.env.MANAGER_USER_IDS.split(",").includes(message.author.id)) {
   message.channel.send(Core.messages.get("servercreateticket", {}));
   return message.delete();
  }

  if (message.channel.type !== "DM" || message.author.bot) return;

  let ticket = Core.tickets.cache.get(message.author.id);

  if (ticket) return handleTicketResponse(ticket, message);
  return handleTicketCreation(message);

 });

 dClient.on("messageUpdate", (oldMessage, message) => {

  if (message.channel.type !== "DM" || message.author.bot) return;

  let ticket = Core.tickets.cache.get(message.author.id);

  if (ticket) return handleTicketEditedResponse(ticket, oldMessage, message);

 });

 function handleTicketEditedResponse(ticket, oldMessage, message, checkAgain = true) {

  if (!ticket.ready && checkAgain) return setTimeout(() => handleTicketEditedResponse(ticket, message, false), 2000);

  ticket.editDMMessage(oldMessage, message);

 }

 function handleTicketResponse(ticket, message, checkAgain = true) {

  if (!ticket.ready && checkAgain) return setTimeout(() => handleTicketResponse(ticket, message, false), 2000);

  ticket.addMessage("DM", message);

 }

 async function handleTicketCreation(message) {

  if (await Core.tickets.isUserIdBlocked(message.author.id))
   return message.reply({
    ...Core.messages.get("youareblocked")
   });

  message.reply(Core.messages.get("dmcreateticket", {
   commentmessageid: message.id
  }));

 }

}