const Core    = require("core"),
      Discord = require("discord.js"),
      fetch   = require("node-fetch");

exports.data = {
 name: "delete",
 description: "Löscht eine Nachricht",
 options: [
  {
   type: "STRING",
   name: "id",
   description: "ID der Nachricht, die gelöscht werden soll.",
   required: true
  }
 ]
}

/**
 * @param {Discord.CommandInteraction} interaction 
 */
exports.run = async (interaction) => {

 // channel.name = userId
 let ticket = Core.tickets.cache.get(interaction.channel.name);

 if (!ticket) return;

 await interaction.deferReply({ ephemeral: true });

 let deleted = await ticket.deleteMessage(interaction.options.get("id").value);

 if (deleted) {

  interaction.editReply({
   content: `${Core.data.config.messageTypes.success.emoji} Nachricht gelöscht.`
  });

 } else {

  interaction.editReply({
   content: `${Core.data.config.messageTypes.error.emoji} Nachricht nicht gefunden.`
  });

 }

}