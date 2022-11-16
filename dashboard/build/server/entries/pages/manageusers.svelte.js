import { j as assign, k as is_function, c as create_ssr_component, v as validate_component } from "../../_app/immutable/chunks/index-80a2f878.js";
import { R as Rolling } from "../../_app/immutable/chunks/Rolling-eaf58c22.js";
/* empty css                                                                          */function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function quintOut(t) {
  return --t * t * t * t * t + 1;
}
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __rest(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function crossfade(_a) {
  var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
  const to_receive = /* @__PURE__ */ new Map();
  const to_send = /* @__PURE__ */ new Map();
  function crossfade2(from, node, params) {
    const { delay = 0, duration = (d2) => Math.sqrt(d2) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
    const to = node.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const dw = from.width / to.width;
    const dh = from.height / to.height;
    const d = Math.sqrt(dx * dx + dy * dy);
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;
    const opacity = +style.opacity;
    return {
      delay,
      duration: is_function(duration) ? duration(d) : duration,
      easing,
      css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
    };
  }
  function transition(items, counterparts, intro) {
    return (node, params) => {
      items.set(params.key, {
        rect: node.getBoundingClientRect()
      });
      return () => {
        if (counterparts.has(params.key)) {
          const { rect } = counterparts.get(params.key);
          counterparts.delete(params.key);
          return crossfade2(rect, node, params);
        }
        items.delete(params.key);
        return fallback && fallback(node, params, intro);
      };
    };
  }
  return [
    transition(to_send, to_receive, false),
    transition(to_receive, to_send, true)
  ];
}
const manageusers_svelte_svelte_type_style_lang = "";
const css = {
  code: 'div.wrapper.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{width:calc(100% - 20px);height:100%;display:flex;align-items:center;justify-content:center}div.box.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{display:flex;flex-direction:column;row-gap:20px;width:100%;max-width:600px;height:calc(100% - 20px);max-height:800px;border-radius:10px;background:rgba(0, 0, 0, .1);border:1px solid rgba(255, 255, 255, .1);padding:20px;box-sizing:border-box}div.text.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{text-align:center}p.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{opacity:.9}div.users.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{position:relative;display:flex;flex-direction:column;background:rgba(0, 0, 0, .1);border-radius:10px;height:100%;overflow-y:auto;padding:10px;padding-top:0;row-gap:10px}div.users.svelte-cs31s5 div.loading.svelte-cs31s5.svelte-cs31s5{width:100%;height:100%;display:flex;align-items:center;justify-content:center}form.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{position:sticky;top:0;padding:10px 0;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;column-gap:10px;row-gap:10px;width:100%;z-index:50;background:#24243b}form.svelte-cs31s5 .svelte-cs31s5.svelte-cs31s5{z-index:50}form.svelte-cs31s5 input[type="text"].svelte-cs31s5.svelte-cs31s5{background:rgba(0, 0, 0, .1);border:1px solid rgba(255, 255, 255, .1);border-radius:5px;outline:none;padding:0 10px;font-size:1em;font-family:var(--font-default);height:35px;color:#fff}form.svelte-cs31s5 button.svelte-cs31s5.svelte-cs31s5{display:flex;align-items:center;justify-content:center;min-height:35px;min-width:35px;max-height:35px;max-width:35px;box-sizing:border-box;border-radius:5px;outline:none;border:1px solid rgba(255, 255, 255, .1);background:var(--clr-green-400);transition:all .2s ease;cursor:pointer;user-select:none}form.svelte-cs31s5 button.svelte-cs31s5.svelte-cs31s5:hover{background:var(--clr-green-450);border-color:rgba(255, 255, 255, .15)}form.svelte-cs31s5 button.svelte-cs31s5.svelte-cs31s5:active{background:var(--clr-green-500);border-color:rgba(255, 255, 255, .2)\n }form.svelte-cs31s5 button.svelte-cs31s5 img.svelte-cs31s5{min-width:60%;max-width:60%;-webkit-user-drag:none}div.users.svelte-cs31s5 div.list.svelte-cs31s5.svelte-cs31s5{display:flex;flex-direction:column;row-gap:5px;z-index:40}div.users.svelte-cs31s5 div.list .svelte-cs31s5.svelte-cs31s5{z-index:40}div.user.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{display:flex;column-gap:10px;align-items:center;border-radius:5px;height:65px;width:100%;transition:all .2s ease;padding:10px;box-sizing:border-box}div.user.manager.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{opacity:.7}div.user.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5:hover{background:rgba(0, 0, 0, .1)}div.user.svelte-cs31s5 img.avatar.svelte-cs31s5.svelte-cs31s5{border-radius:50%;height:100%}div.user.svelte-cs31s5 div.id.svelte-cs31s5.svelte-cs31s5{opacity:.8}div.user.svelte-cs31s5 button.remove.svelte-cs31s5.svelte-cs31s5{display:flex;align-items:center;justify-content:center;background:var(--clr-red-400);border-radius:5px;border:1px solid rgba(255, 255, 255, .1);outline:none;height:25px;width:25px;opacity:0;transition:all .2s ease;pointer-events:none;margin-left:auto;cursor:pointer}div.user.svelte-cs31s5 button.remove img.svelte-cs31s5.svelte-cs31s5{width:15px}div.user.not-manager.svelte-cs31s5:hover button.remove.svelte-cs31s5.svelte-cs31s5{opacity:1;pointer-events:initial}div.user.not-manager.svelte-cs31s5:hover button.remove.svelte-cs31s5.svelte-cs31s5:hover{background:var(--clr-red-450);border-color:rgba(255, 255, 255, .15)}div.user.not-manager.svelte-cs31s5:hover button.remove.svelte-cs31s5.svelte-cs31s5:active{background:var(--clr-red-500);border-color:rgba(255, 255, 255, .2)}div.small-list.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{display:flex;flex-direction:column;row-gap:5px}div.role.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{height:40px;column-gap:10px}div.role.svelte-cs31s5 div.role-name.svelte-cs31s5.svelte-cs31s5{background:var(--role-clr-24);padding:1px 2px;border-radius:3px;transition:all .2s ease}div.role.svelte-cs31s5:hover div.role-name.svelte-cs31s5.svelte-cs31s5{background:var(--role-clr-56)}div.divider.svelte-cs31s5.svelte-cs31s5.svelte-cs31s5{width:100%;height:1px;background:#fff;opacity:.2}',
  map: null
};
const Manageusers = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  crossfade({
    duration: (d) => Math.sqrt(d * 200),
    fallback(node, params) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;
      return {
        duration: 200,
        easing: quintOut,
        css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
      };
    }
  });
  $$result.css.add(css);
  return `${$$result.head += `${$$result.title = `<title>FyFu Modmail</title>`, ""}`, ""}



<div class="${"wrapper svelte-cs31s5"}"><div class="${"box svelte-cs31s5"}"><div class="${"text svelte-cs31s5"}"><h1>Autorisierte User</h1>
   <p class="${"svelte-cs31s5"}">Die untenstehenden User sind berechtigt, Tickets, blockierte User und Snippets \xFCber das Dashboard anzusehen und zu bearbeiten.</p></div>
  <div class="${"users svelte-cs31s5"}">${`<div class="${"loading svelte-cs31s5"}">${validate_component(Rolling, "Loading_Rolling").$$render($$result, { style: "transform: scale(.2);" }, {}, {})}</div>`}</div></div>
</div>`;
});
export {
  Manageusers as default
};
