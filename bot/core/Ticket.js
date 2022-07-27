const { nanoid } = require("nanoid"),
      Discord    = require("discord.js");

/**
 * Represents a not-closed support ticket
 */
class Ticket {

 /**
  * Creates / Opens a ticket
  * @param {Discord.Snowflake} userId 
  * @param {Discord.Snowflake} authorId
  * @param {String} reason
  * @param {String|null} comment
  */
 constructor(userId, authorId, reason, comment = null, attachedUsers = []) {

  if (userId.isTicket) {

   this.ready = true;
   this.ticketId = userId.id;
   this.userId = userId.userId;
   this.authorId = userId.authorId;
   this.dmChannelId = userId.dmChannelId;
   this.reason = userId.reason;
   this.comment = userId.comment;
   this.attachedUsers = JSON.parse(userId.attachedUsers) || [];
   this.createdTimestamp = userId.createdTimestamp;
   this.closedTimestamp = userId.closedTimestamp;
   this.closedAuthorId = userId.closedAuthorId;

   let messages = new Discord.Collection();
   for (let message of JSON.parse(userId.messages))
    messages.set(message.id, message);
   this.messages = messages;

  } else {

   this.ready = false;
   this.ticketId = nanoid(12);
   this.userId = userId;
   this.authorId = authorId;
   this.reason = reason;
   this.comment = comment;
   this.attachedUsers = attachedUsers || [];
   this.createdTimestamp = Date.now();

   this.messages = new Discord.Collection();

  }

 }

 async _init(withDM = true) {

  const Core = require("core");

  let { discordClient: dClient, config } = Core.data;
  
  this.guild = dClient.guilds.resolve(process.env.GUILD_ID);
  this.member = await this.guild.members.fetch(this.userId).catch(() => null);
  this.author = await this.guild.members.fetch(this.authorId).catch(() => null);
  this.user = this.member?.user;

  if (!this.user) throw new Error("User not found");

  // Check DM availability
  if (this.dmChannelId) {
   this.dmChannel = await dClient.channels.fetch(this.dmChannelId).catch(() => null);
  } else {
   this.dmChannel = await this.user.createDM().catch(() => null);
   if (!this.dmChannel) throw new Error("User disabled DMs");
   this.dmChannelId = this.dmChannel.id;
  }
  
  let foundChannel = this.guild.channels.resolve(config.channelIds.ticketsCategory).children.find(c => c.name === this.userId);

  this.channel = this.ready && foundChannel ? foundChannel : (await this.guild.channels.resolve(config.channelIds.ticketsCategory).createChannel(this.userId, {
   reason: `${this.author.user.tag} created a ticket`
  }));

  this.webhook = (await this.channel.fetchWebhooks().then((webhooks) => webhooks.find(w => w.owner?.id === dClient.user.id)).catch(() => null)) || (await this.channel.createWebhook("Messages"));

  let allMessages = this.guild.channels.cache.map(c => c.messages ? [...c.messages.cache.values()] : []).flat();
  let attachedUsersDisplay = (await Promise.all(this.attachedUsers.map(async u => {
   if (Number.isInteger(parseInt(u))) {
    let member = await this.guild.members.fetch(u).catch(() => null),
        user   = member?.user || (await dClient.users.fetch(u).catch(() => null)) || null;
    if (!user) return `**${u}**`;
    let userMessage = allMessages.find(m => m?.author && m.author.id === user.id);
    return `${member?.nickname ? `${member.nickname} | ` : ""}**${user.tag}** | \`${user.id}\`${userMessage ? ` | [Letzte Nachricht](${userMessage.url})` : ""}`
   } else {
    let user = dClient.users.cache.find(u2 => u2.tag === u);
    if (!user) return `**${u}**`;
    let member = this.guild.members.resolve(user.id);
    let userMessage = allMessages.find(m => m?.author && m.author.id === user.id);
    return `${member?.nickname ? `${member.nickname} | ` : ""}**${user.tag}** | \`${user.id}\`${userMessage ? ` | [Letzte Nachricht](${userMessage.url})` : ""}`
   }
  }))).join("\n");

  // Create ticket message
  if (!this.ready) {
   this.infoMessage = await this.channel.send(Core.messages.get("ticketinfo", {
    userid: this.userId,
    usertag: this.user.tag,
    useravatarurl: this.user.displayAvatarURL({dynamic: true}),
    usercreatedtimestamp: Math.floor(this.user.createdTimestamp/1000),
    memberjoinedtimestamp: Math.floor(this.member.joinedTimestamp/1000),
    membernickname: this.member.nickname || "/",
    memberroles: Discord.Util.discordSort(this.member.roles.cache).filter(r => r.id !== process.env.GUILD_ID).map(r => `<@&${r.id}>`).join(" "),
    dmchannelid: this.dmChannel.id,
    reason: this.reason,
    comment: this.comment || "/",
    attachedusers: attachedUsersDisplay,
    ticketId: this.ticketId,
    host: process.env.DASHBOARD_HOST
   }));
  }

  if (withDM && !this.ready) {

   // Send DM message
   this.dmMessage = await this.dmChannel.send(Core.messages.get("dmticketcreated", {
    reason: this.reason,
    comment: this.comment || "/",
    attachedusers: attachedUsersDisplay,
   }));

  }
  
  if (!this.ready)
   Core.database.query(`INSERT INTO tickets (id, userId, authorId, dmChannelId, reason, comment, attachedUsers, createdTimestamp, messages, notifyUserIds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [this.ticketId, this.userId, this.authorId, this.dmChannel?.id, this.reason, this.comment || null, JSON.stringify(this.attachedUsers), this.createdTimestamp, "[]", "[]"]);

  this.ready = true;

 }

 /**
  * Adds a message to the ticket
  * @param {Discord.Message} message
  * @param {String} type DM or GUILD 
  */
 async addMessage(type = "DM", message, anonymous = false) {

  const Core = require("core");

  let messageId        = message.id,
      channelMessageId;

  if (type === "DM") {

   channelMessageId = await this.webhook.send({
    username: `${message.author.username}`,
    avatarURL: message.author.displayAvatarURL({dynamic: true}),
    content: Core.utils.getMessageAsString(message).slice(0, 2000) || "_ _"
   }).then((m) => m?.id);

   let notifyUserIds = JSON.parse((await new Promise((resolve) => Core.database.query("SELECT notifyUserIds FROM tickets WHERE id = ?", [this.ticketId], (err, result) => resolve(result?.[0]?.notifyUserIds))).catch(() => null)) || "[]");
   if (notifyUserIds.length > 0)
    this.channel.send(`Neue Ticketnachricht von ${this.user.tag} | ${notifyUserIds.map(uId => `<@${uId}>`).join(" ")}`).then((m) => m.delete());

  } else if (type === "GUILD") {

   let config = Core.data.config;

   let dmMsg = await this.dmChannel.send({
    content: config.dmPrefixes[anonymous ? "anonymous" : "user"].replace("${user}", message.author.tag).replace("${message}", message.content)
   }).catch(() => "not sent");

   if (dmMsg === "not sent")
    return {
     errCode: 409,
     error: "User disabled direct messages"
    }

   messageId = dmMsg.id;

   channelMessageId = await this.webhook.send({
    username: `${message.author.username} [TEAM]${anonymous ? " [ANONYM]" : ""}`,
    avatarURL: message.author.displayAvatarURL({dynamic: true}),
    content: message.content
   }).then((m) => m?.id);

  }

  this.messages.set(messageId, {
   type,
   id: messageId,
   content: Core.utils.getMessageAsString(message).slice(0, 2000) || "_ _",
   authorId: message.author.id,
   anonymous,
   channelMessageId
  });

  this.saveMessages();

 }

 /**
  * Deletes a message from the ticket using /delete
  * @param {Discord.Snowflake} messageId Webhook message ID
  */
 async deleteMessage(messageId) {

  let dmMessageId = this.messages.find(m => m.channelMessageId === messageId)?.id;

  if (!dmMessageId)
   return false;
   
  this.messages.delete(dmMessageId);

  let deleted = await this.dmChannel.messages.delete(dmMessageId).then(() => true).catch(() => null);

  if (!deleted)
   return false;

  this.channel.messages.delete(messageId).catch(() => null);

  this.saveMessages();

  return true;

 }

 /**
  * Edits a message from in ticket using /edit
  * @param {Discord.Snowflake} messageId Webhook message ID
  */
 async editMessage(messageId, newContent) {

  const Core = require("core");

  let { discordClient: dClient, config } = Core.data;

  let dmMessage = this.messages.find(m => m.channelMessageId === messageId);

  if (!dmMessage)
   return false;

  let edited = await this.dmChannel.messages.edit(dmMessage.id, { content: config.dmPrefixes[dmMessage.anonymous ? "anonymous" : "user"].replace("${user}", await dClient.users.fetch(dmMessage.authorId).then((u) => u.tag).catch(() => null)).replace("${message}", newContent) }).then(() => true).catch(() => null);

  if (!edited)
   return false;

  this.webhook.editMessage(messageId, { content: newContent }).catch(() => null);

  dmMessage.content = newContent;
  this.messages.set(dmMessage.id, dmMessage);

  this.saveMessages();

  return true;

 }

 /**
  * Edits a DM message
  * @param {Discord.Snowflake} messageId Webhook message ID
  */
 async editDMMessage(oldMessage, message) {

  const Core = require("core");

  let dmMessage = this.messages.find(m => m.id === (message.id || oldMessage?.id));

  if (!dmMessage)
   return false;

  let edited = await this.webhook.editMessage(dmMessage.channelMessageId, { content: message?.content }).then(() => true).catch(() => null);

  if (!edited)
   return false;

  dmMessage.content = `[ EDIT - ${new Date().toLocaleString()} ] ${message?.content}\n\n-\n\n${dmMessage.content}`;
  this.messages.set(dmMessage.id, dmMessage);

  this.saveMessages();

  return true;

 }

 /**
  * Saves the current messages to the database
  */
 async saveMessages() {

  const Core = require("core");

  Core.database.query(`UPDATE tickets SET messages=? WHERE id = ?`, [JSON.stringify([...this.messages.values()]), this.ticketId]);

 }

 async notify(userId) {

  const Core = require("core");

  let notifyUserIds = JSON.parse((await new Promise((resolve) => Core.database.query("SELECT notifyUserIds FROM tickets WHERE id = ?", [this.ticketId], (err, result) => resolve(result?.[0]?.notifyUserIds))).catch(() => null)) || "[]");

  if (notifyUserIds.includes(userId)) {

   Core.database.query(`UPDATE tickets SET notifyUserIds = ? WHERE id = ?`, [JSON.stringify(notifyUserIds.filter(uId => uId !== userId)), this.ticketId]);

  } else {

   Core.database.query(`UPDATE tickets SET notifyUserIds= ? WHERE id = ?`, [JSON.stringify([...new Set([...notifyUserIds, userId])]), this.ticketId]);

  }

  return !notifyUserIds.includes(userId);

 }

 async close(interaction) {

  const Core = require("core");

  Core.tickets.cache.delete(this.userId);

  // Send closed message
  interaction[interaction.replied ? "followUp" : "reply"](Core.messages.get("ticketclosed", {
   ticketId: this.ticketId.id,
   authorId: interaction.member.id,
   host: process.env.DASHBOARD_HOST
  }));

  Core.database.query(`UPDATE tickets SET closedTimestamp = ?, closedAuthorId = ? WHERE id = ?`, [Date.now(), interaction.member.id, this.ticketId]);

  let logChannel = Core.data.discordClient.channels.resolve(Core.data.config.channelIds.ticketsLog);

  logChannel?.send?.(Core.messages.get("logticketclosed", {
   userid: this.userId,
   usertag: this.user.tag,
   authorid: interaction.member.id,
   authortag: interaction.member.user.tag,
   authoravatarurl: interaction.member.user.displayAvatarURL({ dynamic: true }),
   ticketid: this.ticketId,
   host: process.env.DASHBOARD_HOST,
   reason: this.reason,
   commentpreview: this.comment ? `${this.comment.slice(0, 200)}${this.comment.length > 200 ? " [...]" : ""}` : null,
   nowtimestamp: Math.floor(Date.now() / 1000)
  })).catch((e) => { console.log(e); return null });

  setTimeout(() => {

   this.channel.delete().catch(() => null);

  }, Core.data.config.deleteChannelAfterClosedInSeconds*1000);

 }

}

module.exports = Ticket;