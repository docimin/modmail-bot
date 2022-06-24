<script>
 import { onMount } from "svelte";
 import Loading_Rolling from "$lib/loading/Rolling.svelte";
 import InfiniteScroll from "svelte-infinite-scroll";
 import { popupData, updateSite } from "$lib/Popup.js";

 let snippets;

 let columns = [
  {
   id: "name",
   label: "Name",
   get: (snippet) => snippet.name,
   width: 20,
   minwidth: 120
  },
  {
   id: "content",
   label: "Content",
   get: (snippet) => snippet.content,
   width: 60,
   minwidth: 170
  }
 ];

 onMount(async () => {

  let result = await fetch("/api/v1/snippets");

  if (result.status === 200)
   snippets = await result.json();

 });

 let snippetsFilter      = "",
     snippetsFilterEmpty = true;

 async function search() {

  snippets = [];

  let searchParams = snippetsFilter ? `phrase=${snippetsFilter}` : "";

  let result = await fetch(`/api/v1/snippets${searchParams ? `?${searchParams} ` : ""}`);

  if (result.status === 200) {
   snippets = await result.json();
  }

 }

 async function loadMore() {

  start = limit;
  limit += 50;

  let searchParams = snippetsFilter ? `phrase=${snippetsFilter}` : "";

  let result = await fetch(`/api/v1/snippets?start=${start}&limit=${limit}${searchParams ? `&${searchParams} ` : ""}`);

  if (result.status === 200) {
   let newSnippets = await result.json();
   snippets = [...snippets, ...newSnippets];
  }
 
 }

 let prevUpdateSite = $updateSite;

 $: if (snippetsFilter && snippetsFilterEmpty) {
  snippetsFilterEmpty = false;
 }
 $: if (!snippetsFilter && !snippetsFilterEmpty) {
  snippetsFilterEmpty = true;
  search();
 }
 $: if ($updateSite !== prevUpdateSite) {
  prevUpdateSite = $updateSite;
  search();
 }
</script>

<div class="container">
  <div class="header">
   <span>Snippets</span>
   <form class="search {snippets ? "" : "disabled"}" on:submit|preventDefault={() => search()}>
    <input type="text" placeholder="Snippet name / content" disabled={!snippets} bind:value={snippetsFilter}>
    <button type="submit">
     <img src="/assets/icons/search-thin.svg" alt="search">
    </button>
    <button class="add" on:click|preventDefault={() => {
     $popupData = {
      key: "snippet-new"
     }
    }}>
     <img src="/assets/icons/plus.svg" alt="new">
    </button>
   </form>
  </div>
  <div class="tickets">
   {#if snippets}
    <div class="ticket columns-template">
     {#each columns as column}
      <div class="column {column.id}" style="width: {column.width}%; min-width: {column.minwidth}px;">{column.label}</div>
     {/each}
    </div>
    {#each snippets as user}
     <button class="ticket">
      {#each columns as column}
       <div class="column {column.id}" style="width: {column.width}%; min-width: {column.minwidth}px;">{@html column.get(user)}</div>
      {/each}
      <div class="column last" style="margin-left: auto; min-width: 30px;">
       <button on:click|preventDefault={() => $popupData = {
        key: "snippet",
        value: {
         name: user.name,
         content: user.content
        }
       }}>
        <img src="/assets/icons/pen.svg" alt="edit">
       </button>
      </div>
     </button>
    {:else}
     <div class="loading">
      Keine Snippets gefunden
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

 form.search button.add {
  background-color: var(--clr-green-400);
 }
 form.search button.add:hover {
  background-color: var(--clr-green-450);
 }
 form.search button.add:active {
  background-color: var(--clr-green-500);
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
  max-height: 60px;
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
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
  max-height: 100%;
  white-space: nowrap;
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