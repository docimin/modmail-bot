export const manifest = {
	appDir: "_app",
	assets: new Set(["assets/icons/arrow-right.svg","assets/icons/blocked.svg","assets/icons/discord_id.svg","assets/icons/discord_link.svg","assets/icons/logout.svg","assets/icons/pen.svg","assets/icons/plus.svg","assets/icons/quote.svg","assets/icons/search-thin.svg","assets/icons/search.svg","assets/icons/tickets.svg","assets/icons/user-settings.svg","assets/icons/x.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		entry: {"file":"_app/immutable/start-0665d124.js","imports":["_app/immutable/start-0665d124.js","_app/immutable/chunks/index-dd217174.js","_app/immutable/chunks/index-32c9bc07.js","_app/immutable/chunks/preload-helper-c28b9807.js","_app/immutable/chunks/singletons-eca981c1.js"],"stylesheets":[]},
		nodes: [
			() => import('./server/nodes/0.js'),
			() => import('./server/nodes/1.js'),
			() => import('./server/nodes/3.js'),
			() => import('./server/nodes/2.js'),
			() => import('./server/nodes/4.js'),
			() => import('./server/nodes/5.js'),
			() => import('./server/nodes/6.js'),
			() => import('./server/nodes/8.js'),
			() => import('./server/nodes/7.js')
		],
		routes: [
			{
				type: 'page',
				id: "",
				pattern: /^\/$/,
				names: [],
				types: [],
				path: "/",
				shadow: null,
				a: [0,2],
				b: [1]
			},
			{
				type: 'page',
				id: "blocked",
				pattern: /^\/blocked\/?$/,
				names: [],
				types: [],
				path: "/blocked",
				shadow: null,
				a: [0,3],
				b: [1]
			},
			{
				type: 'page',
				id: "login",
				pattern: /^\/login\/?$/,
				names: [],
				types: [],
				path: "/login",
				shadow: null,
				a: [0,4],
				b: [1]
			},
			{
				type: 'page',
				id: "manageusers",
				pattern: /^\/manageusers\/?$/,
				names: [],
				types: [],
				path: "/manageusers",
				shadow: null,
				a: [0,5],
				b: [1]
			},
			{
				type: 'page',
				id: "snippets",
				pattern: /^\/snippets\/?$/,
				names: [],
				types: [],
				path: "/snippets",
				shadow: null,
				a: [0,6],
				b: [1]
			},
			{
				type: 'page',
				id: "tickets",
				pattern: /^\/tickets\/?$/,
				names: [],
				types: [],
				path: "/tickets",
				shadow: null,
				a: [0,7],
				b: [1]
			},
			{
				type: 'endpoint',
				id: "api/v1/users",
				pattern: /^\/api\/v1\/users\/?$/,
				names: [],
				types: [],
				load: () => import('./server/entries/endpoints/api/v1/users.js')
			},
			{
				type: 'endpoint',
				id: "api/v1/tickets",
				pattern: /^\/api\/v1\/tickets\/?$/,
				names: [],
				types: [],
				load: () => import('./server/entries/endpoints/api/v1/tickets.js')
			},
			{
				type: 'endpoint',
				id: "api/v1/snippets",
				pattern: /^\/api\/v1\/snippets\/?$/,
				names: [],
				types: [],
				load: () => import('./server/entries/endpoints/api/v1/snippets.js')
			},
			{
				type: 'endpoint',
				id: "api/v1/roles",
				pattern: /^\/api\/v1\/roles\/?$/,
				names: [],
				types: [],
				load: () => import('./server/entries/endpoints/api/v1/roles.js')
			},
			{
				type: 'endpoint',
				id: "api/v1/logout",
				pattern: /^\/api\/v1\/logout\/?$/,
				names: [],
				types: [],
				load: () => import('./server/entries/endpoints/api/v1/logout.js')
			},
			{
				type: 'endpoint',
				id: "api/v1/login",
				pattern: /^\/api\/v1\/login\/?$/,
				names: [],
				types: [],
				load: () => import('./server/entries/endpoints/api/v1/login.js')
			},
			{
				type: 'endpoint',
				id: "api/v1/blocked",
				pattern: /^\/api\/v1\/blocked\/?$/,
				names: [],
				types: [],
				load: () => import('./server/entries/endpoints/api/v1/blocked.js')
			},
			{
				type: 'endpoint',
				id: "api/v1/authorized",
				pattern: /^\/api\/v1\/authorized\/?$/,
				names: [],
				types: [],
				load: () => import('./server/entries/endpoints/api/v1/authorized.js')
			},
			{
				type: 'endpoint',
				id: "api/v1/convert-snowflake-[snowflake]",
				pattern: /^\/api\/v1\/convert-snowflake-([^/]+?)\/?$/,
				names: ["snowflake"],
				types: [null],
				load: () => import('./server/entries/endpoints/api/v1/convert-snowflake-_snowflake_.js')
			},
			{
				type: 'page',
				id: "tickets/[ticketId]",
				pattern: /^\/tickets\/([^/]+?)\/?$/,
				names: ["ticketId"],
				types: [null],
				path: null,
				shadow: null,
				a: [0,8],
				b: [1]
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
