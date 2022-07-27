import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
 server: {
  host: "127.0.0.1",
  port: 3000
 },
 plugins: [sveltekit()]
};

export default config;