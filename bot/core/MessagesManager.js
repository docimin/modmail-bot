const Discord = require("discord.js");

class MessagesManager {

 /**
  * Returns the message data of the given message name.
  * Replaces variables and respects type.
  * @param {String} messageName Name of the message (json)
  * @param {Object} variables Variables to replace
  * @returns {Object} Message data
  */
 static get(messageName, variables = {}) {

  let removeEmptyLines = false;

  const Core = require("core");

  let config = Core.data.config;

  let message     = require(`../assets/messages/${messageName}.json`),
      messageType = config.messageTypes[message.type];

  variables.emoji = messageType?.emoji || "";
  variables.nowtimestamp = Math.floor(Date.now());

  // Replace variables functions
  function applyVariablesOnStr(str, singleStr = false, JSONKey = "") {
   JSONKey = JSONKey.toLowerCase();
   if (!singleStr && removeEmptyLines) {
    let finalArr = str.split("\n").map(l => applyVariablesOnStr(l, true)).filter(l => l);
    if (finalArr.length === 0) return;
    return finalArr.join("\n");
   }
   let removeStr = false;
   function replaceVar(key) {
    /*if (!JSONKey.includes("url") && JSONKey !== "timestamp" && JSONKey !== "type" && JSONKey !== "color")
     usedVisibleVariables.add(key);*/
    if (variables[key])
     return variables[key];
    if (removeEmptyLines)
     removeStr = true;
    return "/"; // if variable not found then "/"
   }
   let finalStr = str.replace(/\$e\[(.[^\]]+)\]/g, (total, content) => { // $e[escapemarkdown]
    let replacedVars = content.replace(/\$\{(\S[^}]+)\}/g, (total, key) => {
     return replaceVar(key);
    });
    return Discord.Util.escapeMarkdown(replacedVars.replace(/\\/g, "\\\\")).replace(/(\\?)(`)/g, (total, slash, symbol) => slash ? total : "\\`"); // fix bug with `` in name
   }).replace(/\$\{(\S[^}]+)\}/g, (total, key) => {
    return replaceVar(key);
   });
   return removeStr && removeEmptyLines ? undefined : finalStr;
  }

  function nestedReplace(item, key) {
   let finalItem = item;
   if (typeof item === "object") {
    if (Array.isArray(item)) {
     for (let i = 0; i < item.length; i++)
      finalItem[i] = nestedReplace(finalItem[i], key);
    } else {
     for (let key in finalItem)
      finalItem[key] = nestedReplace(finalItem[key], key);
    }
   } else if (typeof item === "string") {
    finalItem = applyVariablesOnStr(finalItem, false, key);
   }
   return finalItem;
  }

  message.data.embeds = (message.data.embeds || []).map(e => {
   if (!e.color)
    e.color = messageType?.color;
   return e;
  });

  return nestedReplace(this.toAPIMessage(message.data, { checkFormatting: false }));

 }

 static toAPIMessage(message, { makeEmpty = false, alreadyAPI = false, checkFormatting = true } = {}) { //if makeEmpty then embeds wont be undefined but [], etc. | checkFormatting for urls (https:// etc.) and color codes

  // missing file, sticker_ids and allowed_mentions

  let APIMessage = {
   content: this.stringify(message?.content)?.substring?.(0, 2000) || (makeEmpty ? " " : undefined),
   embeds: message?.embeds?.slice?.(0, 10)?.map?.(e => this.toAPIEmbed(e, { checkFormatting }))?.filter?.(e => e) || (makeEmpty ? [] : undefined),
   components: message?.components?.slice?.(0, 5)?.filter(r => r?.type === 1 && r.components?.join && r.components.length > 0 && r.components.length <= 5 && (!r.components.find(c => c.type === 3) || r.components.length === 1))?.map(r => {
    return {
     type: 1,
     components: r.components.map(c => {
      if (![2, 3].includes(c.type)) return;
      return {
       type: c.type,
       custom_id: alreadyAPI ? c.custom_id : c.style === 5 ? undefined : c.custom_id,
       disabled: c.disabled ? true : false,
       ...(c.type === 2 ? {
        style: [1, 2, 3, 4, 5].includes(c.style) ? c.style : 1,
        label: typeof c.label === "string" ? c.label.substring(0, 80) : " ",
        emoji: c.emoji ? {
         id: c.emoji.id,
         name: c.emoji.name,
         animated: c.emoji.animated ? true : false
        } : undefined,
        url: c.style === 5 ? typeof c.url === "string" ? checkFormatting ? (this.verifyURL(c.url, true) || "https://sapph.xyz/") : c.url : "https://sapph.xyz/" : undefined
       } : c.type === 3 ? {
        options: c.options?.map?.(o => {
         return {
          label: o?.label?.substring?.(0, 100) || undefined,
          value: o?.value?.substring?.(0, 100) || undefined,
          description: o?.description?.substring?.(0, 100) || undefined,
          emoji: o.emoji ? {
           id: o.emoji.id,
           name: o.emoji.name,
           animated: o.emoji.animated ? true : false
          } : undefined,
          default: o?.default ? true : false
         }
        })?.filter?.(o => o?.label && o.value) || [],
        placeholder: c.placeholder?.substring?.(0, 100) || undefined,
        min_values: c.min_values < 0 ? 0 : c.min_values > 25 ? 25 : (c.min_values || undefined),
        max_values: c.max_values < (c.min_values < 0 ? 0 : c.min_values > 25 ? 25 : (c.min_values || 1)) ? (c.min_values < 0 ? 0 : c.min_values > 25 ? 25 : (c.min_values || undefined)) : c.max_values > 25 ? 25 : (c.max_values || undefined),
       } : {})
      }
     }).filter(c => c && (c.type !== 3 || c.options?.length > 0))
    }
   }).filter(r => r.components.length > 0) || (makeEmpty ? [] : undefined),
   message_reference: message?.message_reference || message?.messageReference || message?.reply || message?.replyTo ? {
    message_id: (message?.message_reference || message?.messageReference || message?.reply || message?.replyTo).message_id || (message?.message_reference || message?.messageReference || message?.reply || message?.replyTo).messageId || (message?.message_reference || message?.messageReference || message?.reply || message?.replyTo)?.id
   } : undefined,
   allowed_mentions: message?.allowed_mentions || undefined,
   ephemeral: "ephemeral" in message ? message.ephemeral ? true : false : undefined
  }

  if (!APIMessage.content && APIMessage.embeds?.length === 0) return;

  return APIMessage;

 }

 static toAPIEmbed(embed, { checkFormatting = true} = {}) {

  let apiEmbed = {
   title: this.stringify(embed?.title)?.substring?.(0, 256) || undefined,
   type: embed?.type || "rich",
   description: this.stringify(embed?.description)?.substring?.(0, 4096) || undefined,
   url: embed?.url ? checkFormatting ? (this.verifyURL(embed.url) || undefined) : embed.url : undefined,
   timestamp: embed?.timestamp ? Number.isInteger(parseInt(embed.timestamp)) ? JSON.stringify(parseInt(embed.timestamp)).length === 10 ? parseInt(embed.timestamp)*1000 : parseInt(embed.timestamp) : embed.timestamp : undefined,
   color: checkFormatting ? (() => { try {
    if (!("color" in (embed || {})) || (typeof embed?.color === "string" && embed.color.length === 0)) return undefined;
    return Discord.Util.resolveColor(embed?.color);
   } catch (err) { return undefined } })() : embed?.color,
   footer: embed?.footer?.text || embed?.footer?.icon_url || embed?.footer?.iconURL ? {
    text: this.stringify(embed.footer.text)?.substring?.(0, 2048) || undefined,
    icon_url: checkFormatting ? this.verifyURL(embed.footer.icon_url || embed.footer.iconURL, false, true) : (embed.footer.icon_url || embed.footer.iconURL || undefined)
   } : undefined,
   image: embed?.image?.url ? {
    url: checkFormatting ? this.verifyURL(embed.image.url, false, true) : embed.image.url
   } : undefined,
   thumbnail: embed?.thumbnail?.url ? {
    url: checkFormatting ? this.verifyURL(embed.thumbnail.url, false, true) : embed.thumbnail.url
   } : undefined,
   video: embed?.video?.url ? {
    url: checkFormatting ? this.verifyURL(embed.video.url, false, true) : embed.video.url
   } : undefined,
   author: embed?.author?.name ? {
    name: this.stringify(embed.author.name)?.substring?.(0, 256),
    icon_url: checkFormatting ? this.verifyURL(embed.author.icon_url || embed.author.iconURL, false, true) : (embed.author.icon_url || embed.author.iconURL || undefined),
    url: checkFormatting ? this.verifyURL(embed.author.url) : (embed.author.url || undefined)
   } : undefined,
   fields: embed.fields?.map?.(f => {
    return {
     name: this.stringify(f?.name)?.substring?.(0, 256) || undefined,
     value: this.stringify(f?.value)?.substring?.(0, 1024) || undefined,
     inline: f?.inline ? true : false
    }
   })?.filter?.(f => f.name && f.value)?.slice(0, 25) || undefined
  }

  /**
   * Max. 6000 characters in title, description, field.name, field.value, footer.text and author.name
   */

  let totalCharacters = 0;

  totalCharacters += apiEmbed.title?.length || 0;
  totalCharacters += apiEmbed.author?.name?.length || 0;
  totalCharacters += apiEmbed.footer?.text?.length || 0;
  apiEmbed.description = apiEmbed.description?.substring?.(0, 6000-totalCharacters) || undefined;
  totalCharacters += apiEmbed.description?.length || 0;
  apiEmbed.fields = apiEmbed.fields?.map?.(f => {
   if (totalCharacters >= 6000) return;
   f.name = f.name.substring(0, 6000-totalCharacters);
   totalCharacters += f.name.length;
   if (totalCharacters >= 6000) return;
   f.value = f.value.substring(0, 6000-totalCharacters);
   totalCharacters += f.value.length;
   if (totalCharacters >= 6000 || !f.value) return;
   return f;
  })?.filter?.(f => f) || undefined;

  if (!apiEmbed.title && !apiEmbed.description && !apiEmbed.footer?.text && !apiEmbed.image?.url && !apiEmbed.thumbnail?.url && !apiEmbed.video?.url && !apiEmbed.author?.name && (!apiEmbed.fields || apiEmbed.fields.length === 0))
   return null;

  return apiEmbed;

 }

 static stringify(arr) {
  return arr?.join?.("\n") || arr;
 }

 static verifyURL(url, includeDiscord = false, includeAttachment = false) {

  if (typeof url === "string" && (url.startsWith("https://") || url.startsWith("http://") || (includeDiscord && url.startsWith("discord://")) || (includeAttachment && url.startsWith("attachment://"))))
   return url;

 }

}

module.exports = MessagesManager;