<script>
 export let value, close;

 import Loading_Rolling from "$lib/loading/Rolling.svelte";

 let loading = false;

 $: if (!value?.userId) close();
</script>

<div class="wrapper">
 <p>Möchtest du die Blockierung für <strong>{value?.userId}</strong> aufheben?</p>
 <div class="buttons">
  <button class="ja" on:click={async () => {
   loading = true;
   // todo: fetch to remove block; then: close()
   let result = await fetch(`/api/v1/blocked`, {
    method: "DELETE",
    headers: {
     "Content-Type": "application/json"
    },
    body: JSON.stringify({
     userId: value.userId
    })
   });
   if (result.status === 204)
    close(true);
   else
    console.error(await result.json());
   loading = false;
  }}>
   {#if loading}
    <Loading_Rolling scaleFactor=0.12 />
   {:else}
    Ja
   {/if}
  </button>
  <button class="nein" on:click={() => close()}>Nein</button>
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

 p {
  font-size: 1.1em;
  text-align: center;
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
</style>