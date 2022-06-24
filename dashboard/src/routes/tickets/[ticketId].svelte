<script context="module">
 export async function load({ params }) {

  return {
   status: 200,
   props: params
  };

 }
</script>

<script>
 export let ticketId;

 import { onMount } from "svelte";
 import Loading_Rolling from "$lib/loading/Rolling.svelte";
 import { goto } from "$app/navigation";
 import Tile from "$lib/Tile.svelte";
 import DiscordMessage from "$lib/DiscordMessage.svelte";
 import dayjs from "dayjs";
 import dayjs_relativeTime from "dayjs/plugin/relativeTime.js";
 import dayjs_locale_de from "dayjs/locale/de.js";
 dayjs.extend(dayjs_relativeTime);
 dayjs.locale("de");
 let ticket, users = new Map();

 onMount(async () => {

  let result = await fetch(`/api/v1/tickets?ticketId=${ticketId}`);

  if (result.status === 200) {
   ticket = (await result.json())[0] || null;
   fetchUsers();
  } else
   ticket = null;

 });

 async function fetchUsers() {

  let userIds = [...new Set([ticket.userId, ticket.authorId, ...ticket.messages.map(m => m.authorId)])];

  let result = await fetch(`/api/v1/users?${userIds.map(uId => `userId=${uId}`).join("&")}`);

  if (result.status === 200) {
   for (let user of (await result.json()))
    users.set(user.id, {
     ...user,
     tag: `${user.username}#${user.discriminator}`,
     avatarURL: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png"
    });
   users = Object.assign(users); // set again to refresh svelte values
  }

 }

 let tiles2Element, tiles2OffsetTop = 0;
</script>

<svelte:window on:resize={() => tiles2OffsetTop = tiles2Element?.offsetTop || 0} />

{#if ticket}
 <div class="ticket">
  <div class="bar">
   <div class="back" on:click={() => goto("/tickets")}>
    <img src="/assets/icons/arrow-right.svg" alt="arrow">
   </div>
   <span>Ticket {ticket.id}</span>
  </div>
  <div class="tiles">
   <Tile
    title="User"
   >
    {#if users.get(ticket.userId)}
     <div class="user">
      {#if users.get(ticket.userId).avatar}
       <span class="avatar">
        <img src={users.get(ticket.userId)?.avatarURL} alt="" onerror="this.src = https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png">
       </span>
      {/if}
      <span class="tag">
       {users.get(ticket.userId).tag}
       <span class="id">{ticket.userId}</span>
      </span>
     </div>
    {:else}
     <div class="user">
      {ticket.userId}
     </div>
    {/if}
   </Tile>
   {#if ticket.reason}
    <Tile
     title="Grund"
     style=""
    >
     <div class="created">
      <span>{ticket.reason}</span>
     </div>
    </Tile>
   {/if}
   {#if ticket.attachedUsers?.length > 0}
    <Tile
     title="Anhang"
     style=""
    >
     <div class="created scroll">
      {#each ticket.attachedUsers as attachment}
       <span>{attachment}</span>
      {/each}
     </div>
    </Tile>
   {/if}
   <Tile
    title="Erstellt"
    style=""
   >
    <div class="created">
     <span class="same-line">
      <span>{new Date(parseInt(ticket.createdTimestamp)).toLocaleString()},</span>
      <span class="relative">{dayjs(parseInt(ticket.createdTimestamp)).fromNow()}</span>
     </span>
     <span class="name">von {users.get(ticket.authorId)?.tag}</span>
    </div>
   </Tile>
   {#if ticket.closedTimestamp}
    <Tile
     title="Geschlossen"
     style=""
    >
     <div class="created">
      <span class="same-line">
       <span>{new Date(parseInt(ticket.closedTimestamp)).toLocaleString()},</span>
       <span class="relative">{dayjs(parseInt(ticket.closedTimestamp)).fromNow()}</span>
      </span>
      <span class="name">von {users.get(ticket.closedAuthorId)?.tag}</span>
     </div>
    </Tile>
   {/if}
  </div>
  <div class="tiles" style="margin-top: 20px; height: calc(100% - {tiles2OffsetTop || 0}px - 225px);" bind:this={tiles2Element}>
   <Tile
    title="Nachrichten ({ticket.messages.length})"
    style="height: auto; width: 100%;"
   >
    <div class="messages">
     {#each [...(ticket.comment ? [{ content: ticket.comment, authorId: ticket.userId, timestamp: parseInt(ticket.createdTimestamp) }] : []), ...ticket.messages] as message}
      <div class="message">
       <DiscordMessage json={{...message, dmId: ticket.dmChannelId}} user={users.get(message.authorId) ? {...users.get(message.authorId) } : { id: message.authorId, username: message.authorId, avatarURL: "https://discord.com/assets/1f0bfc0865d324c2587920a7d80c609b.png" }} />
      </div>
     {/each}
    </div>
   </Tile>
  </div>
 </div>
{:else if ticket === null}
 <div class="not-found">
  <span>Ticket not found</span>
  <button on:click|preventDefault={() => goto("/tickets")}>
   <span>See all tickets</span>
   <img src="/assets/icons/arrow-right.svg" alt="arrow">
  </button>
 </div>
{:else}
 <div class="loading">
  <Loading_Rolling style="transform: scale(.2);" />
 </div>
{/if}

<style>
 div.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
 }

 div.ticket {
  width: calc(100% - 20px);
  height: 100%;
 }

 div.bar {
  border-radius: 5px;
  background: rgba(0, 0, 0, .2);
  display: flex;
  align-items: center;
  padding-left: 0;
  margin-bottom: 20px;
  column-gap: 20px;
 }

 div.bar div.back {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  width: 45px;
  cursor: pointer;
 }

 div.bar img {
  width: 20px;
  transform: rotate(180deg);
 }

 div.bar div.back:hover {
  background: rgba(0, 0, 0, .1);
 }

 div.bar div.back:active {
  background: rgba(0, 0, 0, .2);
 }

 div.not-found {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
 }

 div.not-found button {
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 10px;
  border-radius: 5px;
  background-color: var(--clr-400);
  padding: 10px 20px;
  outline: none;
  border: none;
  cursor: pointer;
  transition: background-color .2s ease;
  font-size: .6em;
  font-family: var(--font-default);
  color: #fff;
 }

 div.not-found button:hover {
  background-color: var(--clr-450);
 }

 div.not-found button:active {
  background-color: var(--clr-500);
 }

 div.not-found button span {
  display: flex;
  align-items: center;
 }

 div.not-found button img {
  width: 15px;
  padding-top: 3px;
  box-sizing: border-box;
 }
 
 div.tiles {
  display: flex;
  column-gap: 20px;
  row-gap: 20px;
  flex-wrap: wrap;
 }

 div.tiles div.user {
  display: flex;
  align-items: center;
  column-gap: 10px;
  margin: auto 0;
 }

 div.tiles div.user span.tag {
  display: flex;
  flex-direction: column;
  font-size: 1.2em;
 }

 div.tiles div.user span.tag span.id {
  opacity: 80%;
  font-size: .8em;
 }

 div.tiles div.user span.avatar img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
 }

 div.tiles div.created {
  display: flex;
  flex-direction: column;
  font-size: 1.2em;
  margin: auto 0;
 }

 div.tiles div.created span.same-line {
  display: flex;
  align-items: flex-end;
  column-gap: 5px;
  margin: auto 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
 }

 div.tiles div.created span.relative {
  opacity: 80%;
  font-size: .87em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
 }

 div.tiles div.created span.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
 }

 div.messages {
  border-radius: 5px;
  overflow: hidden;
  margin-top: 10px;
  overflow-y: scroll;
  background: #36393f;
  height: 100%;
 }

 div.scroll {
  overflow-y: scroll
 }

 div.scroll span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 25px;
  font-size: .9em;
 }
</style>
