const Core    = require("core"),
      Discord = require("discord.js"),
      fetch   = require("node-fetch");

exports.data = {
 name: "areply",
 description: "Auf ein Ticket anonym antworten",
 options: [
  {
   type: "STRING",
   name: "anonymous_message",
   description: "Anonyme Nachricht",
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

 let formattedMessage = interaction.options.get("anonymous_message")?.value
 formattedMessage = formattedMessage.replaceAll("\\n", "\n");

 let addMsgResult = await ticket.addMessage("GUILD", {
  author: interaction.member.user,
  content: formattedMessage
 }, true);

 if (addMsgResult?.errCode === 409) {

  interaction.editReply({
   content: `${Core.data.config.messageTypes.error.emoji} **Nachricht konnte nicht gesendet werden:**\n> ${addMsgResult.error}`
  });

 } else {

  interaction.editReply({
   content: `${Core.data.config.messageTypes.success.emoji} Anonyme Nachricht gesendet.`
  });

 }

}