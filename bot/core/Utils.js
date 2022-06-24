class Utils {

 static getMessageAsString(message) {

  let finalString = "";

  if (message?.content)
   finalString += message?.content;

  if (message?.embeds?.length > 0)
   finalString += "\n" + this.getEmbedsAsString(message.embeds);

  if (message?.attachments?.size > 0)
   finalString += "\n" + message?.attachments?.map(a => a?.url)?.join(" ");

  if (message?.stickers?.size > 0)
   finalString += "\n" + message.stickers.map(s => s?.url)?.join(" ");

  return finalString;

 }

}

module.exports = Utils;