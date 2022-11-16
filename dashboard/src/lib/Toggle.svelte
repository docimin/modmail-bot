<script>
 export let toggled, onToggle, style = "", disabled;
</script>

<div class="toggle {toggled ? "active" : ""} {disabled ? "disabled" : ""}" on:click={() => disabled ? null : onToggle ? onToggle() : toggled = !toggled} style={style}>
 <div class="circle" />
</div>

<style>
 
 .toggle {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--clr-blue-600);
  border-radius: 40px;
  width: 45px;
  height: 24px;
  cursor: pointer;
  transition: all .2s ease-out;
  overflow: hidden;
  border: 1px solid rgb(221, 221, 221);
  box-sizing: border-box;
 }

 .circle {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  width: 16px;
  transition: all .2s ease-out;
  background: rgb(221, 221, 221);
  border-radius: 50%;
  z-index: 10;
  margin: 0 3px;
 }

 .toggle:active .circle {
  width: 20px;
  border-radius: 10px;
 }

 .toggle.active {
  background: var(--clr-400);
  border: none;
 }

 .toggle.active .circle {
  background: #fff;
  transform: translateX(22px);
 }

 .toggle.active:active .circle {
  transform: translateX(17px);
 }
</style>