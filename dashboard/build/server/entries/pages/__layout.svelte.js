import { g as getContext, c as create_ssr_component, a as subscribe, e as escape, v as validate_component } from "../../_app/immutable/chunks/index-80a2f878.js";
import { R as Rolling } from "../../_app/immutable/chunks/Rolling-eaf58c22.js";
import { p as popupData, u as updateSite } from "../../_app/immutable/chunks/Popup-07dce18e.js";
/* empty css                                                                          */const app = "";
const getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session,
    updated: stores.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
const Sidebar_svelte_svelte_type_style_lang = "";
const __layout_svelte_svelte_type_style_lang = "";
const css = {
  code: "div.loading.svelte-1p50pmi{position:fixed;top:50%;left:50%;transform:translate(-50%, -50%)}main.userData.svelte-1p50pmi{position:absolute;width:calc(100% - 250px);height:calc(100% - 20px);padding-top:20px;margin-left:250px}div.popup.svelte-1p50pmi{position:fixed;left:50%;top:50%;transform:translate(-50%, -50%);background:#1f1f33;border-radius:5px;padding:20px;width:max-content;height:max-content;max-width:calc(100% - 100px);display:flex;align-items:center;justify-content:center;z-index:500;text-align:center;border:1px solid rgba(255, 255, 255, .2);box-shadow:0 0 5px 0 rgba(0, 0, 0, .5);transition:all .2s ease}div.popup.invisible.svelte-1p50pmi{background:transparent;border-color:transparent;box-shadow:none;z-index:490}div.popup-blur.svelte-1p50pmi{position:fixed;width:100%;height:100%;user-select:none;z-index:480;background:rgba(0, 0, 0, .3)}",
  map: null
};
async function load({ session, url }) {
  if (!(session == null ? void 0 : session.userData) && url.pathname !== "/login")
    return { status: 307, redirect: "/login" };
  if ((session == null ? void 0 : session.userData) && (url.pathname === "/login" || url.pathname === "/"))
    return { status: 307, redirect: "/tickets" };
  return { status: 200, props: session || {} };
}
const _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  var _a;
  let $page, $$unsubscribe_page;
  let $$unsubscribe_popupData;
  let $$unsubscribe_updateSite;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_popupData = subscribe(popupData, (value) => value);
  $$unsubscribe_updateSite = subscribe(updateSite, (value) => value);
  let { userData } = $$props;
  if ($$props.userData === void 0 && $$bindings.userData && userData !== void 0)
    $$bindings.userData(userData);
  $$result.css.add(css);
  $$unsubscribe_page();
  $$unsubscribe_popupData();
  $$unsubscribe_updateSite();
  return `${$$result.head += `${$$result.title = `<title>FyFu Modmail ${escape(((_a = $page.url) == null ? void 0 : _a.pathname.split("/")[1]) ? `| ${$page.url.pathname.split("/")[1][0].toUpperCase()}${$page.url.pathname.split("/")[1].slice(1)}` : "")}</title>`, ""}`, ""}

${`<div class="${"loading svelte-1p50pmi"}">${validate_component(Rolling, "Loading_Rolling").$$render($$result, { style: "transform: scale(.2);" }, {}, {})}</div>`}`;
});
export {
  _layout as default,
  load
};
