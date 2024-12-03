import { c as create_ssr_component, a as subscribe, e as escape, d as add_attribute, v as validate_component, f as each } from "../../_app/immutable/chunks/index-80a2f878.js";
import { R as Rolling } from "../../_app/immutable/chunks/Rolling-d9e7ccd4.js";
import { I as InfiniteScroll } from "../../_app/immutable/chunks/InfiniteScroll-19cda379.js";
import { u as updateSite, p as popupData } from "../../_app/immutable/chunks/Popup-07dce18e.js";
/* empty css                                                                          */const blocked_svelte_svelte_type_style_lang = "";
const css = {
  code: 'div.container.svelte-1m23zr9.svelte-1m23zr9.svelte-1m23zr9{display:flex;flex-direction:column;width:calc(100% - 20px);background:rgba(0, 0, 0, .4);border-radius:5px;padding:20px;box-sizing:border-box;height:calc(100% - 20px);row-gap:10px}div.header.svelte-1m23zr9.svelte-1m23zr9.svelte-1m23zr9{display:flex;justify-content:space-between;align-items:center}div.header.svelte-1m23zr9 span.svelte-1m23zr9.svelte-1m23zr9{font-size:1.5em;font-weight:600}div.loading.svelte-1m23zr9.svelte-1m23zr9.svelte-1m23zr9{position:absolute;left:50%;top:50%;transform:translate(-50%, -50%)}form.search.svelte-1m23zr9.svelte-1m23zr9.svelte-1m23zr9{display:flex;align-items:center;column-gap:10px}form.search.disabled.svelte-1m23zr9.svelte-1m23zr9.svelte-1m23zr9{opacity:50%;cursor:not-allowed;pointer-events:none}form.search.svelte-1m23zr9 input[type="text"].svelte-1m23zr9.svelte-1m23zr9{border-radius:5px;background:rgba(255, 255, 255, .1);border:1px solid rgba(255, 255, 255, .2);height:35px;width:200px;box-sizing:border-box;outline:none;font-size:.9em;color:#fff;font-family:var(--font-default);padding:0 5px}form.search.svelte-1m23zr9 button.svelte-1m23zr9.svelte-1m23zr9{display:flex;align-items:center;justify-content:center;border-radius:5px;background-color:var(--clr-400);width:35px;height:35px;outline:none;border:none;cursor:pointer;transition:background-color .2s ease}form.search.svelte-1m23zr9 button.svelte-1m23zr9.svelte-1m23zr9:hover{background-color:var(--clr-450)}form.search.svelte-1m23zr9 button.svelte-1m23zr9.svelte-1m23zr9:active{background-color:var(--clr-500)}form.search.svelte-1m23zr9 button.svelte-1m23zr9 img.svelte-1m23zr9{width:15px}div.tickets.svelte-1m23zr9.svelte-1m23zr9.svelte-1m23zr9{width:100%;display:flex;flex-direction:column;background:rgba(255, 255, 255, .05);border-radius:5px;padding-bottom:10px;box-sizing:border-box;overflow:hidden;height:100%;overflow-y:auto}div.tickets.svelte-1m23zr9 .ticket.svelte-1m23zr9.svelte-1m23zr9{display:flex;align-items:center;min-height:60px;border-radius:5px;padding:5px 10px;box-sizing:border-box;transition:background-color .2s ease;background-color:transparent;outline:none;border:none;color:#fff;font-family:var(--font-default);font-size:1em;text-align:start;margin:0 5px}div.tickets.svelte-1m23zr9 .ticket.svelte-1m23zr9.svelte-1m23zr9:hover,div.tickets.svelte-1m23zr9 .ticket.svelte-1m23zr9.svelte-1m23zr9:focus{background-color:rgba(0, 0, 0, .1)}div.tickets.svelte-1m23zr9 .ticket div.column.svelte-1m23zr9.svelte-1m23zr9{overflow:hidden;text-overflow:ellipsis}div.tickets.svelte-1m23zr9 .ticket.columns-template.svelte-1m23zr9.svelte-1m23zr9{top:0;background:var(--clr-gray-800);position:sticky;border-radius:5px 5px 0 0;border-bottom:1px solid rgba(255, 255, 255, .1);cursor:default;padding:10px 15px;margin:0}div.tickets.svelte-1m23zr9 .ticket.columns-template div.column.svelte-1m23zr9.svelte-1m23zr9{display:flex;align-items:center}div.tickets.svelte-1m23zr9 .ticket .column.last button.svelte-1m23zr9.svelte-1m23zr9{display:none;align-items:center;justify-content:center;width:30px;height:30px;background:rgb(66, 164, 66);border:1px solid rgba(255, 255, 255, .1);border-radius:5px;outline:none;cursor:pointer;transition:all .2s ease}div.tickets.svelte-1m23zr9 .ticket .column.last button.svelte-1m23zr9.svelte-1m23zr9:hover{background:rgb(29, 130, 29)}div.tickets.svelte-1m23zr9 .ticket .column.last button.svelte-1m23zr9.svelte-1m23zr9:active{background:rgb(39, 90, 39)}div.tickets.svelte-1m23zr9 .ticket .column.last button.svelte-1m23zr9 img.svelte-1m23zr9{width:60%}div.tickets.svelte-1m23zr9 .ticket:hover .column.last button.svelte-1m23zr9.svelte-1m23zr9,div.tickets.svelte-1m23zr9 .ticket:focus .column.last button.svelte-1m23zr9.svelte-1m23zr9{display:flex}',
  map: null
};
const Blocked = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $updateSite, $$unsubscribe_updateSite;
  let $$unsubscribe_popupData;
  $$unsubscribe_updateSite = subscribe(updateSite, (value) => $updateSite = value);
  $$unsubscribe_popupData = subscribe(popupData, (value) => value);
  let blocked, users = /* @__PURE__ */ new Map();
  let columns = [
    {
      id: "user",
      label: "User",
      get: (user) => {
        var _a, _b;
        return users.get(user.id) ? `
    <div style="display: flex; align-items: center; column-gap: 8px;">
     <img src="${(_a = users.get(user.id)) == null ? void 0 : _a.avatarURL}" alt="avatar" style="width: 32px; border-radius: 50%;" />
     <div style="display: flex; flex-direction: column; font-size: .9em;">
      <span>${(_b = users.get(user.id)) == null ? void 0 : _b.tag}</span>
      <span style="font-size: .9em; opacity: 80%;">${user.id}</span>
     </div>
    </div>
   ` : user.id;
      },
      width: 20,
      minwidth: 170
    },
    {
      id: "reason",
      label: "Grund",
      get: (user) => user.reason,
      width: 40,
      minwidth: 100
    },
    {
      id: "author",
      label: "Verantwortlich",
      get: (user) => {
        var _a, _b;
        return users.get(user.authorId) ? `
    <div style="display: flex; align-items: center; column-gap: 8px;">
     <img src="${(_a = users.get(user.authorId)) == null ? void 0 : _a.avatarURL}" alt="avatar" style="width: 32px; border-radius: 50%;" />
     <div style="display: flex; flex-direction: column; font-size: .9em;">
      <span>${(_b = users.get(user.authorId)) == null ? void 0 : _b.tag}</span>
      <span style="font-size: .9em; opacity: 80%;">${user.authorId}</span>
     </div>
    </div>
   ` : user.authorId;
      },
      width: 10,
      minwidth: 250
    },
    {
      id: "date",
      label: "Datum",
      get: (user) => new Date(parseInt(user.blockedTimestamp)).toLocaleString(),
      width: 10,
      minwidth: 130
    }
  ];
  let blockedFilter = "";
  async function search() {
    blocked = [];
    let result = await fetch(`/api/v1/blocked${""}`);
    if (result.status === 200) {
      blocked = await result.json();
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
  return `<div class="${"container svelte-1m23zr9"}"><div class="${"header svelte-1m23zr9"}"><span class="${"svelte-1m23zr9"}">Blockierte User</span>
   <form class="${"search " + escape(blocked ? "" : "disabled", true) + " svelte-1m23zr9"}"><input type="${"text"}" placeholder="${"User ID"}" ${!blocked ? "disabled" : ""} class="${"svelte-1m23zr9"}"${add_attribute("value", blockedFilter, 0)}>
    <button type="${"submit"}" class="${"svelte-1m23zr9"}"><img src="${"/assets/icons/search-thin.svg"}" alt="${"search"}" class="${"svelte-1m23zr9"}"></button></form></div>
  <div class="${"tickets svelte-1m23zr9"}">${blocked ? `<div class="${"ticket columns-template svelte-1m23zr9"}">${each(columns, (column) => {
    return `<div class="${"column " + escape(column.id, true) + " svelte-1m23zr9"}" style="${"width: " + escape(column.width, true) + "%; min-width: " + escape(column.minwidth, true) + "px;"}">${escape(column.label)}</div>`;
  })}</div>
    ${blocked.length ? each(blocked, (user) => {
    return `<button class="${"ticket svelte-1m23zr9"}">${each(columns, (column) => {
      return `<div class="${"column " + escape(column.id, true) + " svelte-1m23zr9"}" style="${"width: " + escape(column.width, true) + "%; min-width: " + escape(column.minwidth, true) + "px;"}"><!-- HTML_TAG_START -->${column.get(user, users)}<!-- HTML_TAG_END --></div>`;
    })}
      <div class="${"column last svelte-1m23zr9"}" style="${"margin-left: auto; min-width: 30px;"}"><button class="${"svelte-1m23zr9"}"><img src="${"/assets/icons/x.svg"}" alt="${"unblock"}" class="${"svelte-1m23zr9"}">
       </button></div>
     </button>`;
  }) : `<div class="${"loading svelte-1m23zr9"}">Keine blockierten User gefunden
     </div>`}
    ${validate_component(InfiniteScroll, "InfiniteScroll").$$render($$result, {}, {}, {})}` : `<div class="${"loading svelte-1m23zr9"}">${validate_component(Rolling, "Loading_Rolling").$$render($$result, { style: "transform: scale(.2);" }, {}, {})}</div>`}</div>
</div>`;
});
export {
  Blocked as default
};
