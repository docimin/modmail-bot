import { c as create_ssr_component, h as createEventDispatcher, e as escape, i as null_to_empty, d as add_attribute, v as validate_component } from "../../_app/immutable/chunks/index-80a2f878.js";
/* empty css                                                                          */const Default_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "button.svelte-tkjn45{display:flex;align-items:center;justify-content:center;border:1px solid rgba(255, 255, 255, .2);box-sizing:border-box;border-radius:5px;padding:10px 15px;color:#fff;background:var(--clr-400);font-family:var(--font-default);transition:all .2s ease;cursor:pointer;font-size:1em;text-align:center}button.not-disabled.svelte-tkjn45:hover{opacity:.8;border:1px solid rgba(255, 255, 255, .5)}button.not-disabled.svelte-tkjn45:active{opacity:.6;border:1px solid rgba(255, 255, 255, .8)}button.disabled.svelte-tkjn45{cursor:default}",
  map: null
};
const Default = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { style = "", disabled = false } = $$props;
  createEventDispatcher();
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0)
    $$bindings.disabled(disabled);
  $$result.css.add(css$1);
  return `<button class="${escape(null_to_empty(disabled ? "disabled" : "not-disabled"), true) + " svelte-tkjn45"}"${add_attribute("style", style, 0)}>${slots.default ? slots.default({}) : `
  Button
 `}
</button>`;
});
const login_svelte_svelte_type_style_lang = "";
const css = {
  code: "div.container.svelte-b5o5q1{display:flex;align-items:center;justify-content:center;position:absolute;flex-direction:column;row-gap:30px;left:50%;top:50%;transform:translate(-50%, -50%);background:rgba(0, 0, 0, .1);border-radius:10px;border:1px solid rgba(0, 0, 0, .3);box-sizing:border-box;width:calc(100% - 10px);height:calc(100% - 10px);max-width:500px;max-height:250px}h1.svelte-b5o5q1{font-style:italic;text-align:center}",
  map: null
};
async function load({ session }) {
  if (session == null ? void 0 : session.userData)
    return { status: 307, redirect: "/" };
  return { status: 200 };
}
const Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let clickedLogin = false;
  $$result.css.add(css);
  return `${$$result.head += `${$$result.title = `<title>Mexify Modmail | Login</title>`, ""}`, ""}

<div class="${"container svelte-b5o5q1"}"><h1 class="${"svelte-b5o5q1"}">mexify modmail</h1>
 ${validate_component(Default, "DefaultButton").$$render(
    $$result,
    {
      style: "border-radius: 100px; padding: 0; width: calc(100% - 10px); max-width: 200px; height: 40px",
      disabled: clickedLogin
    },
    {},
    {
      default: () => {
        return `${`Login with Discord`}`;
      }
    }
  )}
</div>`;
});
export {
  Login as default,
  load
};
