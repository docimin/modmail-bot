const Core    = require("core"),
      Discord = require("discord.js"),
      fetch   = require("node-fetch");

exports.data = {
 name: "unblock",
 description: "Hebt die Blockierung eines Users auf",
 options: [
  {
   type: "USER",
   name: "user",
   description: "User, bei dem die Blockierung aufgehoben werden soll",
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

 Core.database.query(`DELETE FROM blocked WHERE id = ?`, [user.id]);

 interaction.reply({
  ...Core.messages.get("userunblocked", {
   user: user.username
  }),
  ephemeral: true
 });

}