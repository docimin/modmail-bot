<script>
 export let style = "", disabled = false;

 import { createEventDispatcher } from "svelte";

 let dispatch = createEventDispatcher();
</script>

<button class="{disabled ? "disabled" : "not-disabled"}" {style} on:click={() => disabled ? null : dispatch("click")}>
 <slot>
  Button
 </slot>
</button>

<style>
 button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, .2);
  box-sizing: border-box;
  border-radius: 5px;
  padding: 10px 15px;
  color: #fff;
  background: var(--clr-400);
  font-family: var(--font-default);
  transition: all .2s ease;
  cursor: pointer;
  font-size: 1em;
  text-align: center;
 }

 button.not-disabled:hover {
  opacity: .8;
  border: 1px solid rgba(255, 255, 255, .5);
 }

 button.not-disabled:active {
  opacity: .6;
  border: 1px solid rgba(255, 255, 255, .8);
 }

 button.disabled {
  cursor: default;
 }
</style>