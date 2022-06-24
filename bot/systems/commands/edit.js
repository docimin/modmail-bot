const Core    = require("core"),
      Discord = require("discord.js"),
      fetch   = require("node-fetch");

exports.data = {
 name: "edit",
 description: "Editiert eine Nachricht",
 options: [
  {
   type: "STRING",
   name: "id",
   description: "ID der Nachricht, die editiert werden soll",
   required: true
  },
  {
   type: "STRING",
   name: "content",
   description: "Neuer Inhalt der Nachricht",
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

 let edited = await ticket.editMessage(interaction.options.get("id").value, interaction.options.get("content").value);

 if (edited) {

  interaction.editReply({
   content: `${Core.data.config.messageTypes.success.emoji} Nachricht editiert.`
  });

 } else {

  interaction.editReply({
   content: `${Core.data.config.messageTypes.error.emoji} Nachricht nicht gefunden.`
  });

 }

}