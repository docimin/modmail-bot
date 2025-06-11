<script>
 import { page } from "$app/stores";
 import { goto } from "$app/navigation";

 export let userData;
 
 let items = [
  ...(userData.manager ? [{
   path: "manageusers",
   name: "User Management",
   icon: "user-settings.svg"
  }] : []),
  {
   path: "tickets",
   name: "Tickets",
   icon: "tickets.svg"
  },
  {
   path: "blocked",
   name: "Blockierte User",
   icon: "blocked.svg"
  },
  {
   path: "snippets",
   name: "Snippets",
   icon: "quote.svg"
  }
 ]
</script>

<nav>
 <div class="brand">
  <span class="name">mexify modmail</span>
 </div>
 <div class="items">
  {#each items as item}
   <button class="item {$page.url.pathname.split("/")[1] === item.path ? "selected" : "not-selected"}" on:click={() => goto(`/${item.path}`)}>
    <span class="icon">
     <img src="/assets/icons/{item.icon}" alt="icon">
    </span>
    <span class="name">
     {item.name}
    </span>
   </button>
  {/each}
 </div>
 <div class="user">
  {#if userData.avatar}
   <span class="avatar">
    <img src="https://cdn.discordapp.com/avatars/{userData.id}/{userData.avatar}.png" alt="pfp">
   </span>
  {/if}
  <span class="name">
   <span class="username">{userData.username}</span>
   <span class="discriminator">#{userData.discriminator}</span>
  </span>
  <span class="logout" on:click={() => document.location.href = "/api/v1/logout"}>
   <img src="/assets/icons/logout.svg" alt="logout">
  </span>
 </div>
</nav>

<style>
 nav {
  position: fixed;
  width: 230px;
  height: 100%;
  background: rgba(0, 0, 0, .3);
  display: flex;
  flex-direction: column;
 }

 div.brand {
  display: flex;
  height: 100px;
  align-items: center;
  justify-content: center;
 }

 div.brand span.name {
  font-weight: bold;
  font-size: 1.8em;
  font-style: italic;
 }

 div.items {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  align-items: center;
  height: calc(100% - 165px);
  overflow-y: auto;
 }

 div.items button.item {
  display: flex;
  align-items: center;
  padding-left: 20px;
  width: 90%;
  border-radius: 5px;
  background: transparent;
  outline: none;
  border: none;
  color: #fff;
  font-family: var(--font-default);
  font-size: 1em;
  height: 50px;
  column-gap: 10px;
  cursor: pointer;
  transition: all .2s ease;
 }

 div.items button.item.not-selected:hover {
  background: rgba(255, 255, 255, .1);
 }

 div.items button.item.not-selected:active {
  background: rgba(255, 255, 255, .05);
 }

 div.items button.item.selected:hover {
  background: var(--clr-450);
 }

 div.items button.item.selected:active {
  background: var(--clr-500);
 }

 div.items button.item span {
  display: flex;
  align-items: center;
 }

 div.items button.item img {
  width: 20px;
 }

 div.items button.item.selected {
  background: var(--clr-400);
 }

 div.user {
  height: 60px;
  display: flex;
  column-gap: 10px;
  align-items: center;
  font-size: 1.1em;
  box-sizing: border-box;
  padding: 0 10px;
  margin-bottom: 5px;
 }
 
 div.user span.avatar img {
  width: 45px;
  border-radius: 50%;
 }

 div.user span.name {
  display: flex;
  flex-direction: column;
 }

 div.user span.name span.discriminator {
  opacity: 90%;
  font-size: .8em;
 }

 div.user span.logout {
  margin-left: auto;
  cursor: pointer;
  transition: all .2s ease;
 }

 div.user span.logout img {
  width: 25px;
 }

 div.user span.logout:hover {
  opacity: 80%;
 }

 div.user span.logout:active {
  opacity: 60%;
 }
</style>