const Core    = require("core"),
      Discord = require("discord.js"),
      fetch   = require("node-fetch");

exports.data = {
 name: "logs",
 description: "Alle erstellen Tickets eines Users ansehen",
 options: [
  {
   type: "USER",
   name: "user",
   description: "User, dessen Tickets angezeigt werden sollen",
   required: true
  }
 ]
}

/**
 * @param {Discord.CommandInteraction} interaction 
 */
exports.run = async (interaction) => {

 let userId = interaction.options.get("user")?.user?.id,
     user   = await interaction.guild.members.fetch(userId).then((m) => m.user).catch(() => dClient.users.fetch(userId).catch(() => null));

 if (!user) return;

 await interaction.deferReply({ ephemeral: true });

 Core.database.query("SELECT * FROM tickets WHERE userId = ?", [userId], (err, result) => {

  if (err)
   return interaction.editReply({
    content: err
   });

  interaction.editReply({
   embeds: [
    {
     color: Core.data.config.messageTypes.default.color,
     title: `\`${result.length}\` Tickets von ${user.tag}`,
     description: result.map((r) => {
      return `<t:${Math.floor(r.createdTimestamp/1000)}:R> | [${r.reason}](${process.env.DASHBOARD_HOST}/tickets/${r.id})`
     }).join("\n")
    }
   ]
  });

 });

}