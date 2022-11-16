import { c as create_ssr_component, v as validate_component } from "../../../_app/immutable/chunks/index-80a2f878.js";
import { R as Rolling } from "../../../_app/immutable/chunks/Rolling-eaf58c22.js";
import "twemoji";
import "discord-markdown";
import dayjs from "dayjs";
import dayjs_relativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/de.js";
/* empty css                                                                             */const Tile_svelte_svelte_type_style_lang = "";
const DiscordMessage_svelte_svelte_type_style_lang = "";
const Toggle_svelte_svelte_type_style_lang = "";
const _ticketId__svelte_svelte_type_style_lang = "";
const css = {
  code: "div.loading.svelte-qpc9if.svelte-qpc9if{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%)}div.ticket.svelte-qpc9if.svelte-qpc9if{width:calc(100% - 20px);height:100%}div.bar.svelte-qpc9if.svelte-qpc9if{border-radius:5px;background:rgba(0, 0, 0, .2);display:flex;align-items:center;padding-left:0;margin-bottom:20px;column-gap:20px}div.bar.svelte-qpc9if div.back.svelte-qpc9if{display:flex;align-items:center;justify-content:center;height:45px;width:45px;cursor:pointer}div.bar.svelte-qpc9if img.svelte-qpc9if{width:20px;transform:rotate(180deg)}div.bar.svelte-qpc9if div.back.svelte-qpc9if:hover{background:rgba(0, 0, 0, .1)}div.bar.svelte-qpc9if div.back.svelte-qpc9if:active{background:rgba(0, 0, 0, .2)}div.not-found.svelte-qpc9if.svelte-qpc9if{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);display:flex;flex-direction:column;row-gap:20px;justify-content:center;align-items:center;font-size:1.5em}div.not-found.svelte-qpc9if button.svelte-qpc9if{display:flex;align-items:center;justify-content:center;column-gap:10px;border-radius:5px;background-color:var(--clr-400);padding:10px 20px;outline:none;border:none;cursor:pointer;transition:background-color .2s ease;font-size:.6em;font-family:var(--font-default);color:#fff}div.not-found.svelte-qpc9if button.svelte-qpc9if:hover{background-color:var(--clr-450)}div.not-found.svelte-qpc9if button.svelte-qpc9if:active{background-color:var(--clr-500)}div.not-found.svelte-qpc9if button span.svelte-qpc9if{display:flex;align-items:center}div.not-found.svelte-qpc9if button img.svelte-qpc9if{width:15px;padding-top:3px;box-sizing:border-box}div.tiles.svelte-qpc9if.svelte-qpc9if{display:flex;column-gap:20px;row-gap:20px;flex-wrap:wrap}div.tiles.svelte-qpc9if div.user.svelte-qpc9if{display:flex;align-items:center;column-gap:10px;margin:auto 0}div.tiles.svelte-qpc9if div.user span.tag.svelte-qpc9if{display:flex;flex-direction:column;font-size:1.2em}div.tiles.svelte-qpc9if div.user span.tag span.id.svelte-qpc9if{opacity:80%;font-size:.8em}div.tiles.svelte-qpc9if div.user span.avatar img.svelte-qpc9if{width:45px;height:45px;border-radius:50%}div.tiles.svelte-qpc9if div.created.svelte-qpc9if{display:flex;flex-direction:column;font-size:1.2em;margin:auto 0}div.tiles.svelte-qpc9if div.created span.same-line.svelte-qpc9if{display:flex;align-items:flex-end;column-gap:5px;margin:auto 0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}div.tiles.svelte-qpc9if div.created span.relative.svelte-qpc9if{opacity:80%;font-size:.87em;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}div.tiles.svelte-qpc9if div.created span.name.svelte-qpc9if{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}div.messages.svelte-qpc9if.svelte-qpc9if{border-radius:5px;overflow:hidden;margin-top:10px;overflow-y:scroll;background:#36393f;height:100%}div.scroll.svelte-qpc9if.svelte-qpc9if{overflow-y:scroll\r\n }div.scroll.svelte-qpc9if span.svelte-qpc9if{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:25px;font-size:.9em}div.show-internal-msgs.svelte-qpc9if.svelte-qpc9if{display:flex;column-gap:10px;row-gap:10px;margin-top:15px;opacity:.9}",
  map: null
};
async function load({ params }) {
  return { status: 200, props: params };
}
const U5BticketIdu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { ticketId } = $$props;
  dayjs.extend(dayjs_relativeTime);
  dayjs.locale("de");
  if ($$props.ticketId === void 0 && $$bindings.ticketId && ticketId !== void 0)
    $$bindings.ticketId(ticketId);
  $$result.css.add(css);
  return `

${`${`<div class="${"loading svelte-qpc9if"}">${validate_component(Rolling, "Loading_Rolling").$$render($$result, { style: "transform: scale(.2);" }, {}, {})}</div>`}`}`;
});
export {
  U5BticketIdu5D as default,
  load
};
