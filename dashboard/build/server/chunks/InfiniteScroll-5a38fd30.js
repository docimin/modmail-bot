import { c as create_ssr_component, h as createEventDispatcher, o as onDestroy, d as add_attribute } from "./index-aa015feb.js";
const InfiniteScroll = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { threshold = 0 } = $$props;
  let { horizontal = false } = $$props;
  let { elementScroll = null } = $$props;
  let { hasMore = true } = $$props;
  let { reverse = false } = $$props;
  let { window = false } = $$props;
  createEventDispatcher();
  let component;
  onDestroy(() => {
  });
  if ($$props.threshold === void 0 && $$bindings.threshold && threshold !== void 0)
    $$bindings.threshold(threshold);
  if ($$props.horizontal === void 0 && $$bindings.horizontal && horizontal !== void 0)
    $$bindings.horizontal(horizontal);
  if ($$props.elementScroll === void 0 && $$bindings.elementScroll && elementScroll !== void 0)
    $$bindings.elementScroll(elementScroll);
  if ($$props.hasMore === void 0 && $$bindings.hasMore && hasMore !== void 0)
    $$bindings.hasMore(hasMore);
  if ($$props.reverse === void 0 && $$bindings.reverse && reverse !== void 0)
    $$bindings.reverse(reverse);
  if ($$props.window === void 0 && $$bindings.window && window !== void 0)
    $$bindings.window(window);
  return `${!window && !elementScroll ? `<div id="${"svelte-infinite-scroll"}" style="${"width: 0;"}"${add_attribute("this", component, 0)}></div>` : ``}`;
});
export { InfiniteScroll as I };
