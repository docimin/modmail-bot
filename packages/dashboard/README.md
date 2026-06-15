# @modmail/dashboard

TanStack Start (React 19, Vite, Tailwind v4) dashboard for the modmail bot. Auth is better-auth
(Discord). Run everything from the repo root with Bun — see the root `README.md`.

```bash
bun install              # at the repo root
bun run dashboard:dev    # dev server on http://localhost:3000
bun run dashboard:build  # production build -> .output/
```

The dev/build scripts run Vite under Bun's runtime (`bun --bun vite …`) so no Node install is needed.
