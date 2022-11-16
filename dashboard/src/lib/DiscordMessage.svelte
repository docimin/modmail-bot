<script>
 export let json, user,
            roles = [], channels = [];
 
 import twemoji from "twemoji";  
 import discordmd from "discord-markdown";

 function markdown(source) {

  return twemoji.parse(discordMessageMarkdown(source));

 }

 function discordMessageMarkdown(source) {

  const { toHTML } = discordmd;

  source = toHTML(source, {
   discordCallback: {
    user({id}) {
     return `<span class="d-mention-user">@User:${id}</span>`
    },
    channel({id}) {
     return `<span class="d-mention-user">#${channels.find(c => c.id === id)?.name || "channel"}</span>`
    },
    role({id}) {
     let role     = roles.find(r => r.id === id) || {},
         hexColor = `#${role.color ? (DiscordUtil.resolveColor(Number.isInteger(parseInt(role.color)) ? parseInt(role.color) : role.color)?.toString?.(16)?.padStart?.(6, '0') || "5865F2") : "5865F2"}`;
     return `<span class="d-mention-role" style="--clr-role: ${hexColor}; --clr-role-24: ${hexColor}24; --clr-role-56: ${hexColor}56">@${role.name || "Some Role"}</span>`
    },
    everyone() {
     return `<span class="d-mention-everyone">@everyone</span>`
    },
    here() {
     return `<span class="d-mention-everyone">@here</span>`
    }
   },
   embed: false// isEmbed
  });
  source = source.replace(/<a href=".+\$\{(\w+)\}.*">/, (fullText, text) => {
   return fullText.replace(`\${${text}}`, text);
  });
  source = source.replace(/\$\{(\S[^}]+)\}/g, (fullText, text) => {
   return `<span class="md-variable-wrap">$\{</span><span class="md-variable">${text}</span><span class="md-variable-wrap">\}</span>`;
  });
  source = source.replace(/\$e\[(.[^\]]+)\]/g, (fullText, text) => {
   return `<span class="md-escapemarkdown-wrap">[</span>${text}<span class="md-escapemarkdown-wrap">]</span>`;
  });
  return source;

 }

 async function snowflakeToTimestamp(snowflake) {

  if (snowflake)
   return await fetch(`/api/v1/convert-snowflake-${snowflake}`).then(async r => await r.text().then((t) => parseInt(t)));

 }

 function copyText(text) {

  let input = document.createElement("textarea");
  input.innerHTML = text;
  document.body.appendChild(input);
  input.select();
  let result = document.execCommand("copy");
  document.body.removeChild(input);
  return result;

 }

 let showCopiedId, showCopiedLink;
</script>

{#if json}
 <div class="container type-{json.type}" on:click={(e) => { e.path.find(t => t?.classList?.contains?.("d-spoiler") && !t?.classList?.contains?.("d-spoiler-visible"))?.classList.add("d-spoiler-visible");}}>
  <div class="message">
   <div class="user-profile">
    <img src="{user.avatarURL}" alt="avatar" on:error={(t) => t.src = "https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png"}>
   </div>
   <div class="content">
    <div class="user-name">
     <div class="name">{user.username}</div>
     <div class="badges">
      {#if json.type === "GUILD" || json.type === "INTERNAL"}
       <div class="badge" style="background: var(--clr-400);">TEAM</div>
      {/if}
      {#if json.anonymous}
       <div class="badge">ANONYM</div>
      {/if}
     </div>
     {#await snowflakeToTimestamp(json.id)}
      <div class="timestamp">{new Date(json.id ? undefined : json.timestamp).toLocaleString()}</div>
     {:then snowflakeTimestamp}
      <div class="timestamp">{new Date(json.id ? snowflakeTimestamp : json.timestamp).toLocaleString()}</div>
     {/await}
     {#if json.id}
      <div class="actions">
       <div class="copy-id" on:click={() => {
        copyText(json.id);
        showCopiedLink = false;
        showCopiedId = true;
        setTimeout(() => {
         showCopiedId = false;
        }, 1500);
       }}>
        {#if showCopiedId}
         <div class="copied">Copied ID</div>
        {/if}
        <img src="/assets/icons/discord_id.svg" alt="discord_id">
       </div>
       <div class="copy-link" on:click={() => {
        copyText(`https://discord.com/channels/@me/${json.dmId}/${json.id}`);
        showCopiedId = false;
        showCopiedLink = true;
        setTimeout(() => {
         showCopiedLink = false;
        }, 1500);
       }}>
        {#if showCopiedLink}
        <div class="copied">Copied link</div>
        {/if}
        <img src="/assets/icons/discord_link.svg" alt="discord_link">
       </div>
      </div>
     {/if}
    </div>
    {#if typeof json.content === "string" || Array.isArray(json.content)}
     <div class="text">
      {#if json.content && typeof json.content === "string" || Array.isArray(json.content)}
       {@html markdown(typeof json.content === "string" ? json.content.substring(0, 2000) : json.content.join("\n").substring(0, 2000))}
      {/if}
     </div>
     <div class="divider" />
    {/if}
   </div>
  </div>
 </div>
{/if}

<style>

 div.container {
  font-family: "Source Sans Pro", sans-serif;
  background: #36393F;
  width: calc(100% - 10px);
  font-size: 19px;
  letter-spacing: -0.03em;
  font-weight: 300;
  user-select: text;
 }

 div.container.type-INTERNAL {
  background: #36393F;
  background: linear-gradient(90deg, var(--clr-450-8) 0%, #36393F 100%);
  border-left: 3px solid var(--clr-450);
 }

 div.message {
  display: flex;
  width: 100%;
  column-gap: 15px;
  padding: 10px;
 }

 div.message:hover {
  background: #32353b;
 }

 div.user-profile {
  height: 100%;
 }

 div.user-profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
 }
 
 div.content {
  display: flex;
  flex-direction: column;
  width: 100%;
 }

 div.user-name {
  display: flex;
  align-items: center;
  column-gap: 5px;
  font-weight: 400;
 }

 div.user-name div.badges {
  display: flex;
  align-items: center;
  column-gap: 5px;
 }

 div.user-name div.badges div.badge {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 5px;
  border-radius: 3px;
  background: rgb(125, 125, 125);
  font-size: .8em;
 }

 div.user-name div.timestamp {
  color: #72767d;
  font-size: .75em;
 }

 div.user-name div.actions {
  display: none;
  align-items: center;
  column-gap: 5px;
 }
 
 div.message:hover div.user-name div.actions {
  display: flex;
 }

 div.user-name div.actions img {
  width: 15px;
 }

 div.user-name div.actions div {
  opacity: .8;
  cursor: pointer;
  position: relative;
 }

 div.user-name div.actions div div.copied {
  position: absolute;
  bottom: 25px;
  font-size: .8em;
  border-radius: 5px;
  background: rgba(0, 0, 0, .8);
  padding: 5px;
  white-space: nowrap;
  left: 50%;
  transform: translateX(-50%);
 }

 div.user-name div.actions div:hover {
  opacity: 1;
 }

 div.text {
  font-size: .92em;
 }
 
 div.divider {
  height: 3px;
  width: 100%;
 }

 /* MARKDOWN */
 :global(strong) {
  font-weight: 600;
 }

 :global(code) {
  background-color: #2F3136;
  border-radius: 4px;
  color: #fff;
  padding: 2px 2px;
  font-size: .9em;
 }

 :global(pre) {
  margin: 5px 0;
  width: 100%;
  border: 1px solid #202225;
  background-color: #202225;
  padding: 7px 5px;
  box-sizing: border-box;
  border-radius: 4px;
 }

 :global(code.hljs) {
  opacity: 75%;
 }

 :global(blockquote) {
  border-left: 4px solid rgb(79, 84, 92);
  padding-left: 10px;
 }

 :global(a) {
  text-decoration: none;
  color: #0CA9EE;
 }

 :global(a:hover) {
  text-decoration: underline;
 }

 :global(img.d-emoji) {
  transform: translateY(4px);
  width: 18px;
  width: 18px;
 }

 :global(img.emoji) {
  transform: translateY(4px);
  width: 22px;
  width: 22px;
 }

 :global(span.md-escapemarkdown-wrap) {
  position: relative;
  background: rgba(21, 142, 235, 0.8);
  border-radius: 2px;
  padding: 1px 2px;
  font-size: .95em;
  font-weight: 600;
 }

 :global(span.md-escapemarkdown-wrap:hover::before) {
  position: fixed;
  display: flex;
  content: "Text in this brackets will be excluded from markdown parsing.";
  width: 250px;
  font-weight: 400;
  background: rgba(21, 142, 235, 0.1);
  border-radius: 5px;
  padding: 5px;
  font-size: .9em;
  transform: translateX(50%);
  animation: fadeIn .2s ease-in-out;
 }

 @keyframes fadeIn {
  from {
   opacity: 0;
  }
  to {
   opacity: 1;
  }
 }

 :global(span.md-variable-wrap) {
  display: none;
 }

 :global(span.md-variable) {
  background: rgba(115, 135, 150, 0.316);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: .95em;
 }

 :global(span.d-spoiler) {
  background: #202225;
  color: #202225;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
 }

 :global(span.d-spoiler:hover) {
  background: #25262B;
  color: #25262B;
  border-radius: 4px;
  cursor: pointer;
 }

 :global(span.d-spoiler-visible) {
  background: #4A4D53;
  color: #fff;
  border-radius: 4px;
  cursor: text;
  user-select: text;
  -moz-user-select: text;
  -webkit-user-select: text;
 }

 :global(span.d-spoiler-visible:hover) {
  background: #4A4D53;
  color: #fff;
  border-radius: 4px;
  cursor: text;
 }

 :global(span.d-mention-everyone) {
  color: rgba(255, 255, 255, 0.789);
  background-color: #5865f24d;
  border-radius: 4px;
  cursor: text;
  font-weight: bold;
 }

 :global(span.d-mention-user) {
  color: rgba(255, 255, 255, 0.789);
  background-color: #5865f24d;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all .1s ease;
 }

 :global(span.d-mention-user:hover) {
  background-color: #5865f2;
 }

 :global(span.d-mention-role) {
  color: var(--clr-role);
  background-color: var(--clr-role-24);
  border-radius: 4px;
  cursor: text;
  font-weight: bold;
 }

 :global(span.d-mention-role:hover) {
  background-color: var(--clr-role-56);
 }
</style>