import { writable } from "svelte/store";

export let popupData = writable({ key: null, value: null });
export let updateSite = writable(0); // to reload / update site: +1