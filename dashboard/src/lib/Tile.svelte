<script>
 export let title = "Title", width = 300, height = 100, style = "";
</script>

<div class="tile" style="width: {width}px; height: {height}px; {style}">
 <h1>{title}</h1>
 <slot>
  <span>Example description</span>
 </slot>
</div>

<style>
 div.tile {
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, .15);
  border-radius: 10px;
  padding: 10px;
 }

 h1 {
  font-size: 1.8em;
 }
</style>