# Modmail

A public, multi-server **modmail bot** for Discord with a full web dashboard. Members DM the bot,
your staff handle everything from a private inbox (threads or channels), and you configure it all
through slash commands **or** the dashboard.

## Stack

- **Bun** monorepo (package manager + runtime), **TypeScript** everywhere
- **PostgreSQL** + **Drizzle ORM**
- Bot: **discord.js v14** (multi-guild) + an internal **Hono** HTTP API
- Dashboard: **TanStack Start** (React 19, Vite) + **Tailwind v4**
- Auth: **better-auth** (Discord OAuth, `identify email guilds`)

## Packages

| Package              | What it is                                                            |
| -------------------- | --------------------------------------------------------------------- |
| `@modmail/db`        | Drizzle schema (all tables), client, migrations                       |
| `@modmail/core`      | Shared types, settings (zod), message-template engine, permissions    |
| `@modmail/bot`       | discord.js bot, slash commands, modmail engine, internal API, scheduler |
| `@modmail/dashboard` | TanStack Start web app                                                 |

The bot and dashboard share the Postgres database. Anything that needs the Discord gateway
(sending replies, closing tickets, listing channels/roles) goes through the bot's internal API,
which the dashboard calls with a shared secret.

## Prerequisites

- [Bun](https://bun.com) 1.3+
- A PostgreSQL database (a local one via `docker compose up -d` is included)
- A Discord application with a bot — https://discord.com/developers/applications
  - Enable the **Message Content** and **Server Members** privileged intents.
  - Add a redirect URL `http://localhost:3000/api/auth/callback/discord` for the dashboard login.

## Setup

```bash
bun install
cp .env.example .env          # then fill in the values
docker compose up -d          # local postgres on :5433 (optional if you have your own)
bun run db:generate           # generate the SQL migration from the schema
bun run db:migrate            # apply it
```

Fill `.env` (see `.env.example`): `DATABASE_URL`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`,
`DISCORD_BOT_TOKEN`, `BETTER_AUTH_SECRET`, `INTERNAL_API_SECRET`/`BOT_API_SECRET` (must match),
`BETTER_AUTH_URL`, `BOT_API_URL`, `DASHBOARD_URL`.

## Running

```bash
bun run bot:dev          # start the bot (registers global slash commands on ready)
bun run dashboard:dev    # start the dashboard on http://localhost:3000
```

Or both: `bun run dev`.

## Using it

1. **Invite the bot** to a server (the dashboard landing page has an invite link, or use the
   Discord developer portal). It needs Manage Channels, Manage Webhooks, threads and messaging perms.
2. **Set up** either way:
   - Slash command: `/setup inbox #channel`, `/setup logs #channel`, `/setup addstaff @role`,
     `/setup mode threads`, `/setup enable`.
   - Dashboard: open the server, go to **Settings**, pick an inbox channel, staff roles, enable.
3. Members DM the bot → a ticket thread/channel opens for staff. Staff reply with `/reply`,
   `/areply` (anonymous), snippets, or straight from the dashboard ticket view.

## Slash commands

`reply` · `areply` · `close` · `snippet` · `block` · `unblock` · `blocked` · `contact` · `logs` ·
`assign` · `unassign` · `priority` · `note` · `subscribe` · `edit` · `delete` · `move` ·
`transcript` · `userinfo` · `tag` · `category` · `setup` · `settings` · `help` · `stats` · `ping`

## Dashboard

Overview & analytics, ticket list + live ticket view (reply, anonymous, snippets, notes, assign,
priority, tags, close), snippets, blocked users, categories, tags, staff access, audit log, and a
full settings editor (inbox/log channels, staff/admin roles, greeting & close messages, automation,
anti-spam, appearance, pings, working hours).

## Notes

- `bun run db:push` is available for quick local schema sync; prefer `db:generate` + `db:migrate` otherwise.
- Run `bun run typecheck` to typecheck every package, `bun run build` to build the dashboard, `bun run test` for the core unit tests.
