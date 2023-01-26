class Utils {

    static getMessageAsString(message) {
   
     let finalString = "";
   
     if (message?.content)
      finalString += message?.content;
   
     if (message?.embeds?.length > 0)
      //finalString += "\n" + this.getEmbedsAsString(message.embeds);
      // When links are sent and turn into an embed, the embeds array will contain the link as a string, which is the easiest way to save it
      finalString += "\n" + message?.embeds?.url?.toString();
   
     if (message?.attachments?.size > 0)
      finalString += "\n" + message?.attachments?.map(a => a?.url)?.join(" ");
   
     if (message?.stickers?.size > 0)
      finalString += "\n" + message.stickers.map(s => s?.url)?.join(" ");
   
     return finalString;
   
    }
   
   }
   
   module.exports = Utils;