const Core    = require("core"),
      Discord = require("discord.js"),
      fetch   = require("node-fetch");

exports.data = {
 name: "notify",
 description: "Benachrichtigungen bei neuen Ticketnachrichten aktivieren / deaktivieren"
}

/**
 * @param {Discord.CommandInteraction} interaction 
 */
exports.run = async (interaction) => {

 // channel.name = userId
 let ticket = Core.tickets.cache.get(interaction.channel.name);

 if (!ticket) return;

 await interaction.deferReply({ ephemeral: true });

 let result = await ticket.notify(interaction.member.id);

 if (result) {

  interaction.editReply({
   embeds: [{
    color: Core.data.config.messageTypes.success.color,
    title: `${Core.data.config.messageTypes.success.emoji} Benachrichtigung aktiviert`,
    description: "Du wirst bei neuen Nachrichten in diesem Ticket benachrichtigt."
   }]
  });

 } else {

  interaction.editReply({
   embeds: [{
    color: Core.data.config.messageTypes.error.color,
    title: `${Core.data.config.messageTypes.error.emoji} Benachrichtigung deaktiviert`,
    description: "Du wirst bei neuen Nachrichten in diesem Ticket nicht mehr benachrichtigt."
   }]
  });

 }

}