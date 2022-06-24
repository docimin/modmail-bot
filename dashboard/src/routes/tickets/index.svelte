<script>
 import { onMount } from "svelte";
 import { goto } from "$app/navigation";
 import Loading_Rolling from "$lib/loading/Rolling.svelte";
 import InfiniteScroll from "svelte-infinite-scroll";

 let tickets, users = new Map();

 let columns = [
  {
   id: "id",
   label: "ID",
   get: (ticket) => ticket.id,
   width: 10,
   minwidth: 120
  },
  {
   id: "user",
   label: "User",
   get: (ticket) => users.get(ticket.userId) ? `
    <div style="display: flex; align-items: center; column-gap: 8px;">
     <img src="${users.get(ticket.userId)?.avatarURL}" alt="avatar" style="width: 32px; border-radius: 50%;" />
     <div style="display: flex; flex-direction: column; font-size: .9em;">
      <span>${users.get(ticket.userId)?.tag}</span>
      <span style="font-size: .9em; opacity: 80%;">${ticket.userId}</span>
     </div>
    </div>
   ` : ticket.userId,
   width: 20,
   minwidth: 170
  },
  {
   id: "reason",
   label: "Grund",
   get: (ticket) => ticket.reason || "/",
   width: 40,
   minwidth: 100
  },
  {
   id: "created",
   label: "Erstellt",
   get: (ticket) => new Date(parseInt(ticket.createdTimestamp)).toLocaleString(),
   width: 10,
   minwidth: 130
  }
 ];

 onMount(async () => {

  let result = await fetch("/api/v1/tickets");

  if (result.status === 200)
   tickets = await result.json();

  fetchUsers();

 });

 async function fetchUsers() {

  let userIds = [...new Set(tickets.map(ticket => ticket.userId))];

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

 let ticketFilter      = "",
     ticketFilterEmpty = true;

 async function search(userId = false) {

  tickets = [];

  let searchParams = ticketFilter ? `filter=${ticketFilter}` : "";

  let result = await fetch(`/api/v1/tickets${searchParams ? `?${searchParams} ` : ""}`);

  if (result.status === 200) {
   tickets = await result.json();
   if (tickets.length === 0 && ticketFilter && !userId)
    search(true);
  }

 }

 let start = 0,
     limit = 50;

 async function loadMore() {

  start = limit;
  limit += 50;

  let searchParams = ticketFilter ? `filter=${ticketFilter}` : "";

  let result = await fetch(`/api/v1/tickets?start=${start}&limit=${limit}${searchParams ? `&${searchParams} ` : ""}`);

  if (result.status === 200) {
   let newTickets = await result.json();
   tickets = [...tickets, ...newTickets];
  }

  fetchUsers();


 }

 $: if (ticketFilter && ticketFilterEmpty) {
  ticketFilterEmpty = false;
 }
 $: if (!ticketFilter && !ticketFilterEmpty) {
  ticketFilterEmpty = true;
  search();
 }
</script>

<div class="container">
  <div class="header">
   <span>Tickets</span>
   <form class="search {tickets ? "" : "disabled"}" on:submit|preventDefault={() => search()}>
    <input type="text" placeholder="ID / Grund / Nachricht" disabled={!tickets} bind:value={ticketFilter}>
    <button type="submit">
     <img src="/assets/icons/search-thin.svg" alt="search">
    </button>
   </form>
  </div>
  <div class="tickets">
   {#if tickets}
    <div class="ticket columns-template" style="z-index: 100;">
     {#each columns as column}
      <div class="column {column.id}" style="width: {column.width}%; min-width: {column.minwidth}px;">{column.label}</div>
     {/each}
    </div>
    {#each tickets as ticket}
     <button class="ticket" on:click|preventDefault={() => goto(`/tickets/${ticket.id}`)}>
      {#each columns as column}
       <div class="column {column.id}" style="width: {column.width}%; min-width: {column.minwidth}px;">{@html column.get(ticket, users)}</div>
      {/each}
     </button>
    {/each}
    <InfiniteScroll on:loadMore={() => loadMore()} />
   {:else}
    <div class="loading">
     <Loading_Rolling style="transform: scale(.2);" />
    </div>
   {/if}
  </div>
</div>

<style>
 div.container {
  display: flex;
  flex-direction: column;
  width: calc(100% - 20px);
  background: rgba(0, 0, 0, .4);
  border-radius: 5px;
  padding: 20px;
  box-sizing: border-box;
  height: calc(100% - 20px);
  row-gap: 10px;
 }

 div.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
 }

 div.header span {
  font-size: 1.5em;
  font-weight: 600;
 }

 div.loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
 }

 form.search {
  display: flex;
  align-items: center;
  column-gap: 10px;
 }

 form.search.disabled {
  opacity: 50%;
  cursor: not-allowed;
  pointer-events: none;
 }

 form.search input[type="text"] {
  border-radius: 5px;
  background: rgba(255, 255, 255, .1);
  border: 1px solid rgba(255, 255, 255, .2);
  height: 35px;
  width: 200px;
  box-sizing: border-box;
  outline: none;
  font-size: .9em;
  color: #fff;
  font-family: var(--font-default);
  padding: 0 5px;
 }

 form.search button {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background-color: var(--clr-400);
  width: 35px;
  height: 35px;
  outline: none;
  border: none;
  cursor: pointer;
  transition: background-color .2s ease;
 }

 form.search button:hover {
  background-color: var(--clr-450);
 }

 form.search button:active {
  background-color: var(--clr-500);
 }

 form.search button img {
  width: 15px;
 }

 div.tickets {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, .05);
  border-radius: 5px;
  padding-bottom: 10px;
  box-sizing: border-box;
  overflow: hidden;
  height: 100%;
  overflow-y: auto;
 }

 div.tickets .ticket {
  display: flex;
  align-items: center;
  min-height: 60px;
  border-radius: 5px;
  padding: 5px 10px;
  box-sizing: border-box;
  cursor: pointer;
  transition: background-color .2s ease;
  background-color: transparent;
  outline: none;     
  border: none;
  color: #fff;
  font-family: var(--font-default);
  font-size: 1em;
  text-align: start;
  margin: 0 5px;
 }

 div.tickets .ticket:hover, div.tickets .ticket:focus {
  background-color: rgba(0, 0, 0, .1);
 }

 div.tickets .ticket:active {
  background-color: rgba(0, 0, 0, .2);
 }

 div.tickets .ticket div.column {
  overflow: hidden;
  text-overflow: ellipsis;
 }

 div.tickets .ticket.columns-template {
  top: 0;
  background: var(--clr-gray-800);
  position: sticky;
  border-radius: 5px 5px 0 0;
  border-bottom: 1px solid rgba(255, 255, 255, .1);
  cursor: default;
  padding: 10px 15px;
  margin: 0;
 }

 div.tickets .ticket.columns-template div.column {
  display: flex;
  align-items: center;
 }
</style>