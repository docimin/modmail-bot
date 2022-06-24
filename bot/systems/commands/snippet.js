const Core    = require("core"),
      Discord = require("discord.js"),
      fetch   = require("node-fetch");

exports.data = {
 name: "snippet",
 description: "Sendet oder editiert eine Schnellantwort",
 options: [
  {
   type: "STRING",
   name: "snippet",
   description: "Name des Snippets, welches bearbeitet oder gesendet werden soll",
   required: true
  },
  {
   type: "STRING",
   name: "content",
   description: "Neuer Inhalt des Snippets",
   required: false
  }
 ]
}

/**
 * @param {Discord.CommandInteraction} interaction 
 */
exports.run = async (interaction) => {

 let snippetName    = interaction.options.get("snippet").value,
     snippetContent = interaction.options.get("content")?.value;

 if (snippetContent) {

  Core.database.query("INSERT INTO snippets (name, content) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = ?, content = ?", [snippetName, snippetContent, snippetName, snippetContent]);

  interaction.reply({
   ...Core.messages.get("snippetset", {
    name: snippetName,
    content: snippetContent
   }),
   ephemeral: true
  });

 } else {

  // channel.name = userId
  let ticket = Core.tickets.cache.get(interaction.channel.name);

  if (!ticket) return;

  await interaction.deferReply({ ephemeral: true });

  snippetContent = await new Promise((resolve) => Core.database.query("SELECT content FROM snippets WHERE name = ?", [snippetName], (error, results) => resolve(results[0] ? results[0].content : null)));

  if (!snippetContent) return;

  let addMsgResult = await ticket.addMessage("GUILD", {
   author: interaction.member.user,
   content: snippetContent
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

}