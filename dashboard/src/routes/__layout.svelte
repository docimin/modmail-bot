<script context="module">
 export async function load({ session, url }) {

  if (!session?.userData && url.pathname !== "/login")
   return {
    status: 307,
    redirect: "/login"
   }

  if (session?.userData && (url.pathname === "/login" || url.pathname === "/"))
   return {
    status: 307,
    redirect: "/tickets"
   }

  return {
   status: 200,
   props: session || {}
  }

 }
</script>

<script>
 export let userData;

	import '../app.css';
 import { onMount } from "svelte";
 import Loading_Rolling from "$lib/loading/Rolling.svelte";
 import { page } from "$app/stores";
 import Sidebar from "$lib/Sidebar.svelte";
 import { popupData, updateSite } from "$lib/Popup.js";
 import { clickOutside } from "$lib/Utils.js";
 import { fly, fade } from "svelte/transition";

 let mounted;

 onMount(() => mounted = true);
</script>

<svelte:head>
	<title>Mexify Modmail {$page.url?.pathname.split("/")[1] ? `| ${$page.url.pathname.split("/")[1][0].toUpperCase()}${$page.url.pathname.split("/")[1].slice(1)}` : ""}</title>
</svelte:head>

{#if mounted}

 {#if $popupData.key}
   {#await import(`../lib/popups/${$popupData.key}.svelte`)}
    <div class="popup invisible" use:clickOutside on:click_outside={() => $popupData = { key: null, value: null }} out:fly={{y: 50, duration: 150}}>
     <Loading_Rolling style="transform: scale(.2);" />
    </div>
   {:then popupComponent}
    <div class="popup" use:clickOutside on:click_outside={() => $popupData = { key: null, value: null }} out:fly={{y: 50, duration: 150}}>
     <div class="content">
      <svelte:component this={popupComponent.default} value={$popupData.value} close={(update) => {
       if (update)
        $updateSite = $updateSite+1;
       $popupData = { key: null, value: null }
      }} />
     </div>
    </div>
   {/await}
  <div class="popup-blur" transition:fade={{duration: 200}} />
 {/if}

 {#if userData}
  <Sidebar {userData} />
 {/if}

 <main class="{userData ? "userData" : ""}">
 	<slot />
 </main>

{:else}
 <div class="loading">
  <Loading_Rolling style="transform: scale(.2);" />
 </div>
{/if}

<style>
 div.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
 }

 main.userData {
  position: absolute;
  width: calc(100% - 250px);
  height: calc(100% - 20px);
  padding-top: 20px;
  margin-left: 250px;
 }

 div.popup {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #1f1f33;
  border-radius: 5px;
  padding: 20px;
  width: max-content;
  height: max-content;
  max-width: calc(100% - 100px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, .2);
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, .5);
  transition: all .2s ease;
 }

 div.popup.invisible {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
  z-index: 490;
 }

 div.popup-blur {
  position: fixed;
  width: 100%;
  height: 100%;
  user-select: none;
  z-index: 480;
  background: rgba(0, 0, 0, .3);
 }
</style>