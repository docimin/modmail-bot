<script>
 export let value, close;

 import Loading_Rolling from "$lib/loading/Rolling.svelte";
 import { popupData } from "$lib/Popup.js";

 let loading = false;
 
 let snippetContent = value?.content;

 $: if (!value?.name) close();
</script>

<div class="wrapper">
 <h2>Snippet {value?.name}</h2>
 <textarea placeholder="Snippet content" bind:value={snippetContent} />
 <div class="buttons">
  <button class="ja" on:click={async () => {
   loading = "save";
   // todo: fetch to remove block; then: close()
   let result = await fetch(`/api/v1/snippets`, {
    method: "PATCH",
    headers: {
     "Content-Type": "application/json"
    },
    body: JSON.stringify({
     name: value.name,
     content: snippetContent
    })
   });
   if (result.status === 204)
    close(true);
   else
    console.error(await result.json());
  }}>
   {#if loading === "save"}
    <Loading_Rolling scaleFactor=0.12 />
   {:else}
    Speichern
   {/if}
  </button>
  <button class="nein" on:click={async () => {
   $popupData = {
    key: "snippet-delete",
    value: {
     name: value.name
    }
   }
   return;
  }}>
   Löschen
  </button>
 </div>
</div>

<style>
 div.wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  row-gap: 20px;
 }

 div.buttons {
  display: flex;
  align-items: center;
  column-gap: 10px;
  justify-content: center;
  width: 100%;
  overflow: visible;
 }

 button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: lightgray;
  border: 1px solid rgba(255, 255, 255, .1);
  width: 150px;
  height: 40px;
  cursor: pointer;
  border-radius: 5px;
  color: #fff;
  font-weight: 400;
  font-size: 1.1em;
  font-family: var(--font-default);
  transition: all .2s ease;
  overflow: visible;
 }

 button.ja {
  background: var(--clr-green-400);
 }
 button.ja:hover {
  background: var(--clr-green-450);
  border-color: rgba(255, 255, 255, .2);
 }
 button.ja:active {
  background: var(--clr-green-500);
  border-color: rgba(255, 255, 255, .3);
 }

 button.nein {
  background: var(--clr-red-400);
 }
 button.nein:hover {
  background: var(--clr-red-450);
  border-color: rgba(255, 255, 255, .2);
 }
 button.nein:active {
  background: var(--clr-red-500);
  border-color: rgba(255, 255, 255, .3);
 }

 textarea {
  background: rgba(0, 0, 0, .1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 5px;
  resize: none;
  width: 450px;
  height: 130px;
  outline: none;
  padding: 5px;
  box-sizing: border-box;
  font-family: var(--font-default);
  font-size: 1em;
 }

 textarea:focus {
  border-color: rgba(255, 255, 255, .2);
 }
</style>