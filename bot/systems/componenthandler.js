const Core = require("core");

let { discordClient: dClient, config } = Core.data;

exports.run = async () => {

 dClient.on("interactionCreate", async (interaction) => {

  if (!interaction.isMessageComponent()) return;

  if (interaction.customId.startsWith("dm-")) {

   let action = interaction.customId.split("-")[1];

   switch (action) {

    case "reason":
     if (!interaction.isSelectMenu()) break;
     var reason = Core.data.config.ticketReasons[parseInt(interaction.values[0].replace("reason", ""))];
     if (!reason) break;
     interaction.update({
      ...Core.messages.get("dmselectcomment", {
       reason,
       commentmessageurl: getDMMessageRefURL(interaction.message) || `https://discord.com/channels/@me/${interaction.channelId}`
      }),
      components: [
       {
        type: 1,
        components: [
         {
          type: 2,
          label: "Ja, Kommentar anhängen",
          custom_id: `dm-comment-yes-${interaction.values[0].replace("reason", "")}`, // reason index will be saved here
          style: 1,
          emoji: {
           name: "check_white",
           id: Core.data.config.emojiIds["check_white"]
          }
         },
         {
          type: 2,
          label: "Nein, Kommentar weglassen",
          custom_id: `dm-comment-no-${interaction.values[0].replace("reason", "")}`,
          style: 1,
          emoji: {
           name: "x_white",
           id: Core.data.config.emojiIds["x_white"]
          }
         }
        ]
       },
       {
        type: 1,
        components: [
         {
          type: 2,
          label: "Ticket erstellen",
          disabled: true,
          custom_id: "dm-create",
          style: 3
         },
         {
          type: 2,
          label: "Abbrechen",
          custom_id: "dm-cancel",
          style: 4
         }
        ]
       }
      ]
     });
     break;
    case "comment":
     if (!interaction.isButton()) break;
     var reason   = Core.data.config.ticketReasons[parseInt(interaction.customId.split("-")[3])],
         decision = interaction.customId.split("-")[2] === "yes",
         comment  = null;
     if (decision)
      comment = (await getDMMessageRef(interaction.message))?.content;
     interaction.update({
      ...Core.messages.get("dmselectcreate", {
       reason,
       comment: comment || "/"
      }),
      components: [
       {
        type: 1,
        components: [
         {
          type: 2,
          label: "Ticket erstellen",
          custom_id: `dm-create-${decision}-${interaction.customId.split("-")[3]}`, // dm-create-decision-reasonindex -> dm-create-true-0
          style: 3
         },
         {
          type: 2,
          label: "Abbrechen",
          custom_id: "dm-cancel",
          style: 4
         }
        ]
       }
      ]
     });
     break;
    case "cancel":
     if (!interaction.isButton()) break;
     interaction.update({
      ...Core.messages.get("dmselectcancel"),
      components: []
     })
     break;
    case "create":
     if (!interaction.isButton()) break;
     var reason   = Core.data.config.ticketReasons[parseInt(interaction.customId.split("-")[3])],
         decision = interaction.customId.split("-")[2] === "true",
         comment  = null;
     if (decision)
      comment = (await getDMMessageRef(interaction.message))?.content;
     await interaction.update({
      ...Core.messages.get("creatingticket"),
      components: []
     });
     let ticket = await Core.tickets.create(
      interaction.user.id,
      interaction.user.id,
      reason,
      comment
     ).catch((e) => {console.log(e); return null;});
     // Reply to interaction
     await interaction.deleteReply();
     break;

   }

  } else if (interaction.customId === "quickactions") {

   let action = interaction.values[0];

   let ticket = Core.tickets.cache.get(interaction.channel.name);

   if (!ticket) return;

   await interaction.update({});

   switch (action) {

    case "close-ticket":
     ticket.close(interaction);
     break;
    case "send-snippet":
     let snippets = await new Promise((resolve) => Core.database.query("SELECT * FROM snippets", (err, result) => resolve(result)));
     interaction.followUp({
      embeds: [
       {
        color: Core.data.config.messageTypes.default.color,
        title: "Snippets"
       }
      ],
      components: [
       {
        type: 1,
        components: [
         {
          type: 3,
          placeholder: "Wähle ein Snippet zum Senden aus",
          custom_id: "select-snippet",
          disabled: snippets.length === 0,
          options: snippets.length > 0 ? snippets.slice(0, 25).map(s => {
           return {
            label: s.name,
            value: s.name,
            description: `${s.content.slice(0, 32)}${s.content.length > 31 ? "..." : ""}`
           }
          }) : [
           {
            label: "Keine Snippets erstellt",
            value: "none",
            description: "Erstelle ein Snippet mit /snippet.",
            default: true
           }
          ]
         }
        ]
       }
      ],
      ephemeral: true
     })
     break;
    case "block-user":
     Core.database.query(`INSERT INTO blocked (id, authorId, reason, blockedTimestamp) VALUES (?, ?, ?, ?)`, [ticket.userId, interaction.member.id, `Ticket ${ticket.ticketId}`, Date.now()]);
     interaction.followUp({
      ...Core.messages.get("userblocked", {
       user: ticket.user?.tag || ticket.userId
      })
     });
     break;

   }

  } else if (interaction.customId === "select-snippet") {

   await interaction.deferReply({ ephemeral: true });

   let snippetName = interaction.values[0];

   let ticket = Core.tickets.cache.get(interaction.channel.name);

   if (!ticket) return;

   let snippetContent = await new Promise((resolve) => Core.database.query("SELECT content FROM snippets WHERE name = ?", [snippetName], (error, results) => resolve(results[0] ? results[0].content : null)));

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

  } else if (interaction.customId.startsWith("createticket-")) {

   let message = await interaction.channel.messages.fetch(interaction.customId.split("-")[1]).catch(() => null);

   dClient.api.interactions(interaction.id, interaction.token).callback.post({
    data: {
     type: 9,
     data: Core.tickets.getModalData({ type: "create", comment: message?.content || "" })
    }
   });

  }

 });

 function getDMMessageRefURL(message) {

  if (message.reference?.messageId)
   return `https://discord.com/channels/@me/${message.reference.channelId}/${message.reference.messageId}`;

  if (message.message_reference?.message_id)
   return `https://discord.com/channels/@me/${message.message_reference.channel_id}/${message.message_reference.message_id}`;

  return "";

 }

 async function getDMMessageRef(message) {

  let ref;

  if (message.fetchReference)
   ref = await message.fetchReference().catch(() => null);

  if (!ref) {
   let ch = await dClient.channels.fetch(message.channel_id || message.channelId || "nope").catch(() => null);
   if (ch)
    ref = await ch.messages.fetch(message.message_id || message.messageId || "nope").catch(() => null);
  }

  return ref;

 }

}
