const Discord = require("discord.js");

const Ticket = require("./Ticket");

class TicketsManager {

 /**
  * All opened tickets
  * key: userId; value: Ticket
  * @type {Map<Discord.Snowflake, Ticket>}
  */
 static cache = new Discord.Collection();

 static load() {

  return new Promise(async (resolve, reject) => {

   const Core = require("core");

   Core.database.query("SELECT * FROM tickets WHERE closedTimestamp IS NULL", async (err, result) => {

    if (err)
     return reject(err);

    for (let ticket of result) {

     if (!TicketsManager.cache.get(ticket.userId)) {

      ticket.isTicket = true;

      ticket = new Ticket(ticket);

      await ticket._init().then(() => {
       TicketsManager.cache.set(ticket.userId, ticket);
      }).catch(() => null);

     }

    }

    console.log(`Loaded ${result.length} open tickets.`);

    resolve();

   });

  });

 }

 /**
  * Creates / Opens a ticket
  * @param {Discord.Snowflake} userId 
  * @param {Discord.Snowflake} authorId 
  * @param {String} reason 
  * @param {String|null} comment
  * @param {boolean} withDM
  * @returns {Ticket} Ticket
  */
 static async create(userId, authorId, reason, comment = null, attachedUsers = [], withDM = true) {

  if (this.cache.get(userId)) return this.cache.get(userId);

  let ticket = new Ticket(userId, authorId, reason, comment, attachedUsers);

  TicketsManager.cache.set(userId, ticket);

  await ticket._init(withDM);

  return ticket;

 }

 static isUserIdBlocked(userId) {

  return new Promise((resolve) => {

   const Core = require("core");

   Core.database.query("SELECT id FROM blocked WHERE id = ?", [userId], (err, result) => {

    if (result?.length > 0)
     return resolve(true);

    resolve(false);

   });

  });

 }

 static getModalData({ type, comment = "" }) {
  switch (type) {
   case "create":
    return {
     custom_id: "createticket",
     title: "Create support ticket",
     components: [{ type: 1, components: [{
      type: 4,
      custom_id: "reason",
      label: "Reason - Why open a ticket?",
      style: 1,
      min_length: 4,
      max_length: 100,
      placeholder: "Example: \"Report user\" or \"I have a question\"",
      required: true
     }] }, { type: 1, components: [{
      type: 4,
      custom_id: "comment",
      label: "Comment - Describe your request in more detail",
      style: 2,
      min_length: 1,
      max_length: 1000,
      value: comment?.slice?.(0, 990) || null,
      placeholder: "Example: \"The user has offended in #general\" or \"How do I get the sub role?\"",
      required: true
     }], }, { type: 1, components: [{
      type: 4,
      custom_id: "userids",
      label: "Username / IDs (optional)",
      style: 1,
      max_length: 500,
      placeholder: "Example: \"Faye#0001\" or \"196742608846979072 176088246697197570\"",
      required: false
     }] }]
    };
  }
  return {};
 }

 static handleModals() {

  const Core = require("core");

  let dClient = Core.data.discordClient;

  dClient.on("raw", async (event) => {

   let eventName = event.t,
       eventData = event.d;

   if (eventName !== "INTERACTION_CREATE" || eventData.type !== 5 || eventData.data?.custom_id !== "createticket") return;

   let isDM = dClient.channels.resolve(eventData.channel_id)?.type === "DM";

   let modalData = {};
   for (let data of eventData.data.components.map(c => c.components.map(c2 => c2)).flat())
    modalData[data.custom_id] = data.value;

   let interaction = isDM ? new Discord.MessageComponentInteraction(dClient, eventData) : new Discord.BaseCommandInteraction(dClient, eventData);

   // Send loading message
   await interaction.reply({
    ...Core.messages.get("creatingticket"),
    ephemeral: !isDM
   });

   if (await Core.tickets.isUserIdBlocked(interaction.user.id))
    return interaction.editReply({
     ...Core.messages.get("youareblocked"),
     ephemeral: !isDM
    });

   let ticket = await Core.tickets.create(
    interaction.user.id,
    interaction.user.id,
    modalData.reason,
    modalData.comment,
    modalData.userids?.split?.(" ") || []
   ).catch((e) => {console.log(e); return null;});

   if (!ticket)
    return await interaction.editReply({
     ...Core.messages.get("ticketnotcreated"),
     ephemeral: !isDM
    });

   // Reply to interaction
   if (isDM)
    await interaction.deleteReply();
   else
    await interaction.editReply({
     ...Core.messages.get("ticketcreated", {
      dmmessageurl: `https://discord.com/channels/@me/${ticket.dmChannelId}`
     }),
     ephemeral: !isDM
    });

  });

 }

}

module.exports = TicketsManager;