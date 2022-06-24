<svelte:head>
	<title>FyFu Modmail</title>
</svelte:head>

<script>
 import { onMount } from "svelte";
 import Loading_Rolling from "$lib/loading/Rolling.svelte";
 import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";
	import { flip } from "svelte/animate";

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === "none" ? "" : style.transform;

			return {
				duration: 200,
				easing: quintOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});

 let authedUserIds, managerUserIds, authedRoleIds, roles = new Map(), users = new Map();

 let enteredUserId = "";

 let addingUser = false;

 onMount(async () => {

  fetchAuthedUsers();

 });

 async function fetchAuthedUsers() {

  let result = await fetch("/api/v1/authorized");

  if (result.status === 200) {
   let resultJSON = await result.json();
   authedUserIds = resultJSON.userIds;
   managerUserIds = resultJSON.managerIds;
   authedRoleIds = resultJSON.roleIds;
   fetchUsers();
   fetchRoles();
  }

 }

 async function fetchUsers() {

  let userIds = [...authedUserIds];

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

 async function fetchRoles() {

  let result = await fetch("/api/v1/roles");

  if (result.status === 200) {
   for (let role of (await result.json()))
    roles.set(role.id, role);
   roles = Object.assign(roles);
  }

 }
</script>

<div class="wrapper">
 <div class="box">
  <div class="text">
   <h1>Autorisierte User</h1>
   <p>Die untenstehenden User sind berechtigt, Tickets, blockierte User und Snippets über das Dashboard anzusehen und zu bearbeiten.</p>
  </div>
  <div class="users">
   {#if authedUserIds}
    <form on:submit|preventDefault={async () => {
     if (addingUser) return;
     addingUser = true;
     await fetchRoles();
     let result = await fetch("/api/v1/authorized", {
      method: "PUT",
      headers: {
       "Content-Type": "application/json"
      },
      body: JSON.stringify({
       id: enteredUserId,
       type: roles.has(enteredUserId) ? "role" : "user"
      })
     });
     if (result.status === 204) {
      fetchAuthedUsers();
     }
     enteredUserId = "";
     addingUser = false;
    }}>
     <input type="text" placeholder="User ID / Role ID" bind:value={enteredUserId} disabled={addingUser}>
     <button disabled={addingUser}>
      {#if addingUser}
       <Loading_Rolling scaleFactor={0.1} />
      {:else}
       <img src="/assets/icons/plus.svg" alt="add">
      {/if}
     </button>
    </form>
    {#if authedRoleIds?.length > 0}
     <div class="small-list">
      {#each authedRoleIds as roleId (roleId)}
       <div 
        class="user role not-manager"
        in:receive={{key: roleId}}
        animate:flip={{duration: 200}}
       >
        {#if roles.has(roleId)}
         <div class="role-name" style="--role-clr: {roles.get(roleId).color}; --role-clr-24: {roles.get(roleId).color}BF; --role-clr-56: {roles.get(roleId).color}F0;">@{roles.get(roleId).name}</div>
        {/if}
        <div class="id">{roleId}</div>
        <button class="remove" on:click|preventDefault={async () => {
         await fetch("/api/v1/authorized", {
          method: "DELETE",
          headers: {
           "Content-Type": "application/json"
          },
          body: JSON.stringify({
           id: roleId
          })
         });
         fetchAuthedUsers();
        }}><img src="/assets/icons/x.svg" alt="remove"></button>
       </div>
      {/each}
     </div>
     <div class="divider" />
    {/if}
    <div class="list">
     {#each authedUserIds as userId (userId)}
      <div
       class="user {managerUserIds.includes(userId) ? "manager" : "not-manager"}"
       in:receive={{key: userId}}
       animate:flip={{duration: 200}}
      >
       {#if users.has(userId)}
        {#if users.get(userId).avatar}
         <img src={users.get(userId).avatarURL} alt="avatar-{userId}" class="avatar">
        {/if}
        <div class="name">
         <div class="tag">{users.get(userId).tag}</div>
         <div class="id">{userId}</div>
        </div>
       {:else}
        <div class="id">
         {userId}
        </div>
       {/if}
       <button class="remove" on:click|preventDefault={async () => {
        await fetch("/api/v1/authorized", {
         method: "DELETE",
         headers: {
          "Content-Type": "application/json"
         },
         body: JSON.stringify({
          id: userId
         })
        });
        fetchAuthedUsers();
       }}><img src="/assets/icons/x.svg" alt="remove"></button>
      </div>
     {/each}
    </div>
   {:else}
    <div class="loading">
     <Loading_Rolling style="transform: scale(.2);" />
    </div>
   {/if}
  </div>
 </div>
</div>

<style>
 div.wrapper {
  width: calc(100% - 20px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 div.box {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  width: 100%;
  max-width: 600px;
  height: calc(100% - 20px);
  max-height: 800px;
  border-radius: 10px;
  background: rgba(0, 0, 0, .1);
  border: 1px solid rgba(255, 255, 255, .1);
  padding: 20px;
  box-sizing: border-box;
 }

 div.text {
  text-align: center;
 }

 p {
  opacity: .9;
 }

 div.users {
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, .1);
  border-radius: 10px;
  height: 100%;
  overflow-y: auto;
  padding: 10px;
  padding-top: 0;
  row-gap: 10px;
 }

 div.users div.loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
 }

 form {
  position: sticky;
  top: 0;
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  column-gap: 10px;
  row-gap: 10px;
  width: 100%;
  z-index: 50;
  background: #24243b;
 }

 form * {
  z-index: 50;
 }

 form input[type="text"] {
  background: rgba(0, 0, 0, .1);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 5px;
  outline: none;
  padding: 0 10px;
  font-size: 1em;
  font-family: var(--font-default);
  height: 35px;
  color: #fff;
 }

 form button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 35px;
  min-width: 35px;
  max-height: 35px;
  max-width: 35px;
  box-sizing: border-box;
  border-radius: 5px;
  outline: none;
  border: 1px solid rgba(255, 255, 255, .1);
  background: var(--clr-green-400);
  transition: all .2s ease;
  cursor: pointer;
  user-select: none;
 }

 form button:hover {
  background: var(--clr-green-450);
  border-color:rgba(255, 255, 255, .15);
 }
 form button:active {
  background: var(--clr-green-500);
  border-color:rgba(255, 255, 255, .2)
 }

 form button img {
  min-width: 60%;
  max-width: 60%;
  -webkit-user-drag: none;
 }

 div.users div.list {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
  z-index: 40;
 }

 div.users div.list * {
  z-index: 40;
 }

 div.user {
  display: flex;
  column-gap: 10px;
  align-items: center;
  border-radius: 5px;
  height: 65px;
  width: 100%;
  transition: all .2s ease;
  padding: 10px;
  box-sizing: border-box;
 }

 div.user.manager {
  opacity: .7;
 }

 div.user:hover {
  background: rgba(0, 0, 0, .1);
 }

 div.user img.avatar {
  border-radius: 50%;
  height: 100%;
 }

 div.user div.id {
  opacity: .8;
 }

 div.user button.remove {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--clr-red-400);
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, .1);
  outline: none;
  height: 25px;
  width: 25px;
  opacity: 0;
  transition: all .2s ease;
  pointer-events: none;
  margin-left: auto;
  cursor: pointer;
 }

 div.user button.remove img {
  width: 15px;
 }

 div.user.not-manager:hover button.remove {
  opacity: 1;
  pointer-events: initial;
 }
 div.user.not-manager:hover button.remove:hover {
  background: var(--clr-red-450);
  border-color: rgba(255, 255, 255, .15);
 }
 div.user.not-manager:hover button.remove:active {
  background: var(--clr-red-500);
  border-color: rgba(255, 255, 255, .2);
 }

 div.small-list {
  display: flex;
  flex-direction: column;
  row-gap: 5px;
 }

 div.role {
  height: 40px;
  column-gap: 10px;
 }

 div.role div.role-name {
  background: var(--role-clr-24);
  padding: 1px 2px;
  border-radius: 3px;
  transition: all .2s ease;
 }

 div.role:hover div.role-name {
  background: var(--role-clr-56);
 }

 div.divider {
  width: 100%;
  height: 1px;
  background: #fff;
  opacity: .2;
 }
</style>