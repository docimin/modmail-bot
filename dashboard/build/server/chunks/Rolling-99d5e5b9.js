import { c as create_ssr_component, e as escape } from "./index-aa015feb.js";
/* empty css                                                */const css = {
  code: ".spinner-rolling-2.svelte-1852m2u div.svelte-1852m2u{position:absolute;width:calc(145px * var(--scale-factor));height:calc(145px * var(--scale-factor));border:calc(14px * var(--scale-factor)) solid var(--clr);border-top-color:transparent;border-left-color:transparent;border-radius:50%}.spinner-rolling-2.svelte-1852m2u div.svelte-1852m2u{animation:svelte-1852m2u-spinner-rolling-2 .5s linear infinite;top:calc(112px * var(--scale-factor));left:calc(112px * var(--scale-factor))}.spinner-rolling.svelte-1852m2u.svelte-1852m2u{width:calc(224px * var(--scale-factor));height:calc(224px * var(--scale-factor));display:inline-block;overflow:hidden;background:transparent}.spinner-rolling-2.svelte-1852m2u.svelte-1852m2u{width:100%;height:100%;position:relative;transform:translateZ(0) scale(1);backface-visibility:hidden;transform-origin:0 0}.spinner-rolling-2.svelte-1852m2u div.svelte-1852m2u{box-sizing:content-box}@keyframes svelte-1852m2u-spinner-rolling-2{0%{transform:translate(-50%,-50%) rotate(0deg)}100%{transform:translate(-50%,-50%) rotate(360deg)}}",
  map: null
};
const Rolling = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { color = "#fff", style = "", scaleFactor = 1 } = $$props;
  if ($$props.color === void 0 && $$bindings.color && color !== void 0)
    $$bindings.color(color);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.scaleFactor === void 0 && $$bindings.scaleFactor && scaleFactor !== void 0)
    $$bindings.scaleFactor(scaleFactor);
  $$result.css.add(css);
  return `<div class="${"spinner-rolling svelte-1852m2u"}" style="${"--scale-factor: " + escape(scaleFactor) + "; " + escape(style)}"><div class="${"spinner-rolling-2 svelte-1852m2u"}" style="${"--clr: " + escape(color) + ";"}"><div class="${"svelte-1852m2u"}"></div></div>
</div>`;
});
export { Rolling as R };
