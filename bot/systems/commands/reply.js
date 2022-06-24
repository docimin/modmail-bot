const Core    = require("core"),
      Discord = require("discord.js"),
      fetch   = require("node-fetch");

exports.data = {
 name: "reply",
 description: "Auf ein Ticket antworten",
 options: [
  {
   type: "STRING",
   name: "message",
   description: "Nachricht",
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

 let addMsgResult = await ticket.addMessage("GUILD", {
  author: interaction.member.user,
  content: interaction.options.get("message")?.value
 });

 if (addMsgResult?.errCode === 409) {

  interaction.editReply({
   content: `${Core.data.config.messageTypes.error.emoji} **Nachricht konnte nicht gesendet werden:**\n> ${addMsgResult.error}`
  });

 } else {

  interaction.editReply({
   content: `${Core.data.config.messageTypes.success.emoji} Nachricht gesendet.`
  });

 }

}