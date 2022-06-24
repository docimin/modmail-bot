const Core    = require("core"),
      Discord = require("discord.js"),
      fetch   = require("node-fetch");

exports.data = {
 name: "block",
 description: "Blockiert einen User",
 options: [
  {
   type: "USER",
   name: "user",
   description: "User, der blockiert werden soll",
   required: true
  },
  {
   type: "STRING",
   name: "reason",
   description: "Grund für die Blockierung",
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

 Core.database.query(`INSERT INTO blocked (id, authorId, reason, blockedTimestamp) VALUES (?, ?, ?, ?)`, [user.id, interaction.member.id, interaction.options.get("reason").value, Date.now()]);

 interaction.reply({
  ...Core.messages.get("userblocked", {
   user: user.tag
  }),
  ephemeral: true
 });

}