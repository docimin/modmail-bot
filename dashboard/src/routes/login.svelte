<script context="module">
 export async function load({ session }) {

  if (session?.userData)
   return {
    status: 307,
    redirect: "/"
   }
  
  return {
   status: 200
  }

 }
</script>
<script>
 import DefaultButton from "$lib/buttons/Default.svelte";
 import Loading_Rolling from "$lib/loading/Rolling.svelte";

 let clickedLogin = false;
</script>

<svelte:head>
	<title>Mexify Modmail | Login</title>
</svelte:head>

<div class="container">
 <h1>mexify modmail</h1>
 <DefaultButton
  style="border-radius: 100px; padding: 0; width: calc(100% - 10px); max-width: 200px; height: 40px"
  disabled={clickedLogin}
  on:click={() => {
   clickedLogin = true;
   document.location.href = "/api/v1/login";
  }}
 >
  {#if clickedLogin}
   <Loading_Rolling style="transform: scale(.1);" />
  {:else}
   Login with Discord
  {/if}
 </DefaultButton>
</div>

<style>
 div.container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  flex-direction: column;
  row-gap: 30px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, .1);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, .3);
  box-sizing: border-box;
  width: calc(100% - 10px);
  height: calc(100% - 10px);
  max-width: 500px;
  max-height: 250px;
 }

 h1 {
  font-style: italic;
  text-align: center;
 }
</style>