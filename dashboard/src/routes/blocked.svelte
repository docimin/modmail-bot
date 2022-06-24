<script>
 import { onMount } from "svelte";
 import Loading_Rolling from "$lib/loading/Rolling.svelte";
 import InfiniteScroll from "svelte-infinite-scroll";
 import { popupData, updateSite } from "$lib/Popup.js";

 let blocked, users = new Map();

 let columns = [
  {
   id: "user",
   label: "User",
   get: (user) => users.get(user.id) ? `
    <div style="display: flex; align-items: center; column-gap: 8px;">
     <img src="${users.get(user.id)?.avatarURL}" alt="avatar" style="width: 32px; border-radius: 50%;" />
     <div style="display: flex; flex-direction: column; font-size: .9em;">
      <span>${users.get(user.id)?.tag}</span>
      <span style="font-size: .9em; opacity: 80%;">${user.id}</span>
     </div>
    </div>
   ` : user.id,
   width: 20,
   minwidth: 170
  },
  {
   id: "reason",
   label: "Grund",
   get: (user) => user.reason,
   width: 40,
   minwidth: 100
  },
  {
   id: "author",
   label: "Verantwortlich",
   get: (user) => users.get(user.authorId) ? `
    <div style="display: flex; align-items: center; column-gap: 8px;">
     <img src="${users.get(user.authorId)?.avatarURL}" alt="avatar" style="width: 32px; border-radius: 50%;" />
     <div style="display: flex; flex-direction: column; font-size: .9em;">
      <span>${users.get(user.authorId)?.tag}</span>
      <span style="font-size: .9em; opacity: 80%;">${user.authorId}</span>
     </div>
    </div>
   ` : user.authorId,
   width: 10,
   minwidth: 250
  },
  {
   id: "date",
   label: "Datum",
   get: (user) => new Date(parseInt(user.blockedTimestamp)).toLocaleString(),
   width: 10,
   minwidth: 130
  }
 ];

 onMount(async () => {

  let result = await fetch("/api/v1/blocked");

  if (result.status === 200)
   blocked = await result.json();

  fetchUsers();

 });

 async function fetchUsers() {

  let userIds = [...new Set(blocked.map(b => [b.id, b.authorId]).flat())];

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

 let blockedFilter      = "",
     blockedFilterEmpty = true;

 async function search() {

  blocked = [];

  let searchParams = blockedFilter ? `userId=${blockedFilter}` : "";

  let result = await fetch(`/api/v1/blocked${searchParams ? `?${searchParams} ` : ""}`);

  if (result.status === 200) {
   blocked = await result.json();
  }

 }

 async function loadMore() {

  start = limit;
  limit += 50;

  let searchParams = blockedFilter ? `userId=${blockedFilter}` : "";

  let result = await fetch(`/api/v1/blocked?start=${start}&limit=${limit}${searchParams ? `&${searchParams} ` : ""}`);

  if (result.status === 200) {
   let newBlocked = await result.json();
   blocked = [...blocked, ...newBlocked];
  }
  
  fetchUsers();

 }

 let prevUpdateSite = $updateSite;

 $: if (blockedFilter && blockedFilterEmpty) {
  blockedFilterEmpty = false;
 }
 $: if (!blockedFilter && !blockedFilterEmpty) {
  blockedFilterEmpty = true;
  search();
 }
 $: if ($updateSite !== prevUpdateSite) {
  prevUpdateSite = $updateSite;
  search();
 }
</script>

<div class="container">
  <div class="header">
   <span>Blockierte User</span>
   <form class="search {blocked ? "" : "disabled"}" on:submit|preventDefault={() => search()}>
    <input type="text" placeholder="User ID" disabled={!blocked} bind:value={blockedFilter}>
    <button type="submit">
     <img src="/assets/icons/search-thin.svg" alt="search">
    </button>
   </form>
  </div>
  <div class="tickets">
   {#if blocked}
    <div class="ticket columns-template">
     {#each columns as column}
      <div class="column {column.id}" style="width: {column.width}%; min-width: {column.minwidth}px;">{column.label}</div>
     {/each}
    </div>
    {#each blocked as user}
     <button class="ticket">
      {#each columns as column}
       <div class="column {column.id}" style="width: {column.width}%; min-width: {column.minwidth}px;">{@html column.get(user, users)}</div>
      {/each}
      <div class="column last" style="margin-left: auto; min-width: 30px;">
       <button on:click|preventDefault={() => $popupData = {
        key: "unblock",
        value: {
         userId: user.id
        }
       }}>
        <img src="/assets/icons/x.svg" alt="unblock">
       </button>
      </div>
     </button>
    {:else}
     <div class="loading">
      Keine blockierten User gefunden
     </div>
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

 div.tickets .ticket .column.last button {
  display: none;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: rgb(66, 164, 66);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 5px;
  outline: none;
  cursor: pointer;
  transition: all .2s ease;
 }

 div.tickets .ticket .column.last button:hover {
  background: rgb(29, 130, 29);
 }
 div.tickets .ticket .column.last button:active {
  background: rgb(39, 90, 39);
 }

 div.tickets .ticket .column.last button img {
  width: 60%;
 }

 div.tickets .ticket:hover .column.last button, div.tickets .ticket:focus .column.last button {
  display: flex;
 }
</style>