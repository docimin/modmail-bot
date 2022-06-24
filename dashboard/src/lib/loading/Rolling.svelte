<script>
 export let color = "#fff", style = "", scaleFactor = 1;
</script>

<div class="spinner-rolling" style="--scale-factor: {scaleFactor}; {style}">
 <div class="spinner-rolling-2" style="--clr: {color};">
  <div></div>
 </div>
</div>
 
<style>
 .spinner-rolling-2 div {
  position: absolute;
  width: calc(145px * var(--scale-factor));
  height: calc(145px * var(--scale-factor));
  border: calc(14px * var(--scale-factor)) solid var(--clr);
  border-top-color: transparent;
  border-left-color: transparent;
  border-radius: 50%;
 }

 .spinner-rolling-2 div {
  animation: spinner-rolling-2 .5s linear infinite;
  top: calc(112px * var(--scale-factor));
  left: calc(112px * var(--scale-factor));
 }

 .spinner-rolling {
  width: calc(224px * var(--scale-factor));
  height: calc(224px * var(--scale-factor));
  display: inline-block;
  overflow: hidden;
  background: transparent;
 }

 .spinner-rolling-2 {
  width: 100%;
  height: 100%;
  position: relative;
  transform: translateZ(0) scale(1);
  backface-visibility: hidden;
  transform-origin: 0 0;
 }

 .spinner-rolling-2 div {
  box-sizing: content-box;
 }

 @keyframes spinner-rolling-2 {
  0% {
   transform: translate(-50%,-50%) rotate(0deg);
  }
  100% { 
   transform: translate(-50%,-50%) rotate(360deg);
  }
 }
</style>