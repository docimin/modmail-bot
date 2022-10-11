import { c as create_ssr_component, a as subscribe, e as escape, d as add_attribute, v as validate_component, f as each } from "../../_app/immutable/chunks/index-80a2f878.js";
import { R as Rolling } from "../../_app/immutable/chunks/Rolling-ee5dd404.js";
import { I as InfiniteScroll } from "../../_app/immutable/chunks/InfiniteScroll-2328116c.js";
import { u as updateSite, p as popupData } from "../../_app/immutable/chunks/Popup-07dce18e.js";
/* empty css                                                                          */const snippets_svelte_svelte_type_style_lang = "";
const css = {
  code: 'div.container.svelte-1b09m5s.svelte-1b09m5s.svelte-1b09m5s{display:flex;flex-direction:column;width:calc(100% - 20px);background:rgba(0, 0, 0, .4);border-radius:5px;padding:20px;box-sizing:border-box;height:calc(100% - 20px);row-gap:10px}div.header.svelte-1b09m5s.svelte-1b09m5s.svelte-1b09m5s{display:flex;justify-content:space-between;align-items:center}div.header.svelte-1b09m5s span.svelte-1b09m5s.svelte-1b09m5s{font-size:1.5em;font-weight:600}div.loading.svelte-1b09m5s.svelte-1b09m5s.svelte-1b09m5s{position:absolute;left:50%;top:50%;transform:translate(-50%, -50%)}form.search.svelte-1b09m5s.svelte-1b09m5s.svelte-1b09m5s{display:flex;align-items:center;column-gap:10px}form.search.disabled.svelte-1b09m5s.svelte-1b09m5s.svelte-1b09m5s{opacity:50%;cursor:not-allowed;pointer-events:none}form.search.svelte-1b09m5s input[type="text"].svelte-1b09m5s.svelte-1b09m5s{border-radius:5px;background:rgba(255, 255, 255, .1);border:1px solid rgba(255, 255, 255, .2);height:35px;width:200px;box-sizing:border-box;outline:none;font-size:.9em;color:#fff;font-family:var(--font-default);padding:0 5px}form.search.svelte-1b09m5s button.svelte-1b09m5s.svelte-1b09m5s{display:flex;align-items:center;justify-content:center;border-radius:5px;background-color:var(--clr-400);width:35px;height:35px;outline:none;border:none;cursor:pointer;transition:background-color .2s ease}form.search.svelte-1b09m5s button.svelte-1b09m5s.svelte-1b09m5s:hover{background-color:var(--clr-450)}form.search.svelte-1b09m5s button.svelte-1b09m5s.svelte-1b09m5s:active{background-color:var(--clr-500)}form.search.svelte-1b09m5s button.svelte-1b09m5s img.svelte-1b09m5s{width:15px}form.search.svelte-1b09m5s button.add.svelte-1b09m5s.svelte-1b09m5s{background-color:var(--clr-green-400)}form.search.svelte-1b09m5s button.add.svelte-1b09m5s.svelte-1b09m5s:hover{background-color:var(--clr-green-450)}form.search.svelte-1b09m5s button.add.svelte-1b09m5s.svelte-1b09m5s:active{background-color:var(--clr-green-500)}div.tickets.svelte-1b09m5s.svelte-1b09m5s.svelte-1b09m5s{width:100%;display:flex;flex-direction:column;background:rgba(255, 255, 255, .05);border-radius:5px;padding-bottom:10px;box-sizing:border-box;overflow:hidden;height:100%;overflow-y:auto}div.tickets.svelte-1b09m5s .ticket.svelte-1b09m5s.svelte-1b09m5s{display:flex;align-items:center;min-height:60px;max-height:60px;height:60px;overflow:hidden;text-overflow:ellipsis;border-radius:5px;padding:5px 10px;box-sizing:border-box;transition:background-color .2s ease;background-color:transparent;outline:none;border:none;color:#fff;font-family:var(--font-default);font-size:1em;text-align:start;margin:0 5px}div.tickets.svelte-1b09m5s .ticket.svelte-1b09m5s.svelte-1b09m5s:hover,div.tickets.svelte-1b09m5s .ticket.svelte-1b09m5s.svelte-1b09m5s:focus{background-color:rgba(0, 0, 0, .1)}div.tickets.svelte-1b09m5s .ticket div.column.svelte-1b09m5s.svelte-1b09m5s{overflow:hidden;text-overflow:ellipsis;max-height:100%;white-space:nowrap}div.tickets.svelte-1b09m5s .ticket.columns-template.svelte-1b09m5s.svelte-1b09m5s{top:0;background:var(--clr-gray-800);position:sticky;border-radius:5px 5px 0 0;border-bottom:1px solid rgba(255, 255, 255, .1);cursor:default;padding:10px 15px;margin:0}div.tickets.svelte-1b09m5s .ticket.columns-template div.column.svelte-1b09m5s.svelte-1b09m5s{display:flex;align-items:center}div.tickets.svelte-1b09m5s .ticket .column.last button.svelte-1b09m5s.svelte-1b09m5s{display:none;align-items:center;justify-content:center;width:30px;height:30px;background:rgb(66, 164, 66);border:1px solid rgba(255, 255, 255, .1);border-radius:5px;outline:none;cursor:pointer;transition:all .2s ease}div.tickets.svelte-1b09m5s .ticket .column.last button.svelte-1b09m5s.svelte-1b09m5s:hover{background:rgb(29, 130, 29)}div.tickets.svelte-1b09m5s .ticket .column.last button.svelte-1b09m5s.svelte-1b09m5s:active{background:rgb(39, 90, 39)}div.tickets.svelte-1b09m5s .ticket .column.last button.svelte-1b09m5s img.svelte-1b09m5s{width:60%}div.tickets.svelte-1b09m5s .ticket:hover .column.last button.svelte-1b09m5s.svelte-1b09m5s,div.tickets.svelte-1b09m5s .ticket:focus .column.last button.svelte-1b09m5s.svelte-1b09m5s{display:flex}',
  map: null
};
const Snippets = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $updateSite, $$unsubscribe_updateSite;
  let $$unsubscribe_popupData;
  $$unsubscribe_updateSite = subscribe(updateSite, (value) => $updateSite = value);
  $$unsubscribe_popupData = subscribe(popupData, (value) => value);
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
  let snippetsFilter = "";
  async function search() {
    snippets = [];
    let result = await fetch(`/api/v1/snippets${""}`);
    if (result.status === 200) {
      snippets = await result.json();
    }
  }
  let prevUpdateSite = $updateSite;
  $$result.css.add(css);
  {
    if ($updateSite !== prevUpdateSite) {
      prevUpdateSite = $updateSite;
      search();
    }
  }
  $$unsubscribe_updateSite();
  $$unsubscribe_popupData();
  return `<div class="${"container svelte-1b09m5s"}"><div class="${"header svelte-1b09m5s"}"><span class="${"svelte-1b09m5s"}">Snippets</span>
   <form class="${"search " + escape(snippets ? "" : "disabled", true) + " svelte-1b09m5s"}"><input type="${"text"}" placeholder="${"Snippet name / content"}" ${!snippets ? "disabled" : ""} class="${"svelte-1b09m5s"}"${add_attribute("value", snippetsFilter, 0)}>
    <button type="${"submit"}" class="${"svelte-1b09m5s"}"><img src="${"/assets/icons/search-thin.svg"}" alt="${"search"}" class="${"svelte-1b09m5s"}"></button>
    <button class="${"add svelte-1b09m5s"}"><img src="${"/assets/icons/plus.svg"}" alt="${"new"}" class="${"svelte-1b09m5s"}"></button></form></div>
  <div class="${"tickets svelte-1b09m5s"}">${snippets ? `<div class="${"ticket columns-template svelte-1b09m5s"}">${each(columns, (column) => {
    return `<div class="${"column " + escape(column.id, true) + " svelte-1b09m5s"}" style="${"width: " + escape(column.width, true) + "%; min-width: " + escape(column.minwidth, true) + "px;"}">${escape(column.label)}</div>`;
  })}</div>
    ${snippets.length ? each(snippets, (user) => {
    return `<button class="${"ticket svelte-1b09m5s"}">${each(columns, (column) => {
      return `<div class="${"column " + escape(column.id, true) + " svelte-1b09m5s"}" style="${"width: " + escape(column.width, true) + "%; min-width: " + escape(column.minwidth, true) + "px;"}"><!-- HTML_TAG_START -->${column.get(user)}<!-- HTML_TAG_END --></div>`;
    })}
      <div class="${"column last svelte-1b09m5s"}" style="${"margin-left: auto; min-width: 30px;"}"><button class="${"svelte-1b09m5s"}"><img src="${"/assets/icons/pen.svg"}" alt="${"edit"}" class="${"svelte-1b09m5s"}">
       </button></div>
     </button>`;
  }) : `<div class="${"loading svelte-1b09m5s"}">Keine Snippets gefunden
     </div>`}
    ${validate_component(InfiniteScroll, "InfiniteScroll").$$render($$result, {}, {}, {})}` : `<div class="${"loading svelte-1b09m5s"}">${validate_component(Rolling, "Loading_Rolling").$$render($$result, { style: "transform: scale(.2);" }, {}, {})}</div>`}</div>
</div>`;
});
export {
  Snippets as default
};
