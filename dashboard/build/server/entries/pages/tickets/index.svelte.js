import { c as create_ssr_component, e as escape, d as add_attribute, v as validate_component } from "../../../_app/immutable/chunks/index-80a2f878.js";
<<<<<<< HEAD
import { R as Rolling } from "../../../_app/immutable/chunks/Rolling-70cd4588.js";
=======
import { R as Rolling } from "../../../_app/immutable/chunks/Rolling-eaf58c22.js";
>>>>>>> cfe3d57d7ff2894a22f422988fe520aad1b8482c
/* empty css                                                                             */const index_svelte_svelte_type_style_lang = "";
const css = {
  code: 'div.container.svelte-1wcasmu.svelte-1wcasmu{display:flex;flex-direction:column;width:calc(100% - 20px);background:rgba(0, 0, 0, .4);border-radius:5px;padding:20px;box-sizing:border-box;height:calc(100% - 20px);row-gap:10px}div.header.svelte-1wcasmu.svelte-1wcasmu{display:flex;justify-content:space-between;align-items:center}div.header.svelte-1wcasmu span.svelte-1wcasmu{font-size:1.5em;font-weight:600}div.loading.svelte-1wcasmu.svelte-1wcasmu{position:absolute;left:50%;top:50%;transform:translate(-50%, -50%)}form.search.svelte-1wcasmu.svelte-1wcasmu{display:flex;align-items:center;column-gap:10px}form.search.disabled.svelte-1wcasmu.svelte-1wcasmu{opacity:50%;cursor:not-allowed;pointer-events:none}form.search.svelte-1wcasmu input[type="text"].svelte-1wcasmu{border-radius:5px;background:rgba(255, 255, 255, .1);border:1px solid rgba(255, 255, 255, .2);height:35px;width:200px;box-sizing:border-box;outline:none;font-size:.9em;color:#fff;font-family:var(--font-default);padding:0 5px}form.search.svelte-1wcasmu button.svelte-1wcasmu{display:flex;align-items:center;justify-content:center;border-radius:5px;background-color:var(--clr-400);width:35px;height:35px;outline:none;border:none;cursor:pointer;transition:background-color .2s ease}form.search.svelte-1wcasmu button.svelte-1wcasmu:hover{background-color:var(--clr-450)}form.search.svelte-1wcasmu button.svelte-1wcasmu:active{background-color:var(--clr-500)}form.search.svelte-1wcasmu button img.svelte-1wcasmu{width:15px}div.tickets.svelte-1wcasmu.svelte-1wcasmu{width:100%;display:flex;flex-direction:column;background:rgba(255, 255, 255, .05);border-radius:5px;padding-bottom:10px;box-sizing:border-box;overflow:hidden;height:100%;overflow-y:auto}div.tickets.svelte-1wcasmu .ticket.svelte-1wcasmu{display:flex;align-items:center;min-height:60px;border-radius:5px;padding:5px 10px;box-sizing:border-box;cursor:pointer;transition:background-color .2s ease;background-color:transparent;outline:none;border:none;color:#fff;font-family:var(--font-default);font-size:1em;text-align:start;margin:0 5px}div.tickets.svelte-1wcasmu .ticket.svelte-1wcasmu:hover,div.tickets.svelte-1wcasmu .ticket.svelte-1wcasmu:focus{background-color:rgba(0, 0, 0, .1)}div.tickets.svelte-1wcasmu .ticket.svelte-1wcasmu:active{background-color:rgba(0, 0, 0, .2)}div.tickets.svelte-1wcasmu .ticket div.column.svelte-1wcasmu{overflow:hidden;text-overflow:ellipsis}div.tickets.svelte-1wcasmu .ticket.columns-template.svelte-1wcasmu{top:0;background:var(--clr-gray-800);position:sticky;border-radius:5px 5px 0 0;border-bottom:1px solid rgba(255, 255, 255, .1);cursor:default;padding:10px 15px;margin:0}div.tickets.svelte-1wcasmu .ticket.columns-template div.column.svelte-1wcasmu{display:flex;align-items:center}',
  map: null
};
const Tickets = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let ticketFilter = "";
  $$result.css.add(css);
  return `<div class="${"container svelte-1wcasmu"}"><div class="${"header svelte-1wcasmu"}"><span class="${"svelte-1wcasmu"}">Tickets</span>
   <form class="${"search " + escape("disabled", true) + " svelte-1wcasmu"}"><input type="${"text"}" placeholder="${"ID / Grund / Nachricht"}" ${"disabled"} class="${"svelte-1wcasmu"}"${add_attribute("value", ticketFilter, 0)}>
    <button type="${"submit"}" class="${"svelte-1wcasmu"}"><img src="${"/assets/icons/search-thin.svg"}" alt="${"search"}" class="${"svelte-1wcasmu"}"></button></form></div>
  <div class="${"tickets svelte-1wcasmu"}">${`<div class="${"loading svelte-1wcasmu"}">${validate_component(Rolling, "Loading_Rolling").$$render($$result, { style: "transform: scale(.2);" }, {}, {})}</div>`}</div>
</div>`;
});
export {
  Tickets as default
};
