# Bun-only image for the whole monorepo. Run the bot and the dashboard as two
# services (override the command per service in compose / your orchestrator).
FROM oven/bun:1 AS base
WORKDIR /app

# install deps (cached on manifests + lockfile)
COPY package.json bun.lock* ./
COPY packages/db/package.json packages/db/
COPY packages/core/package.json packages/core/
COPY packages/bot/package.json packages/bot/
COPY packages/dashboard/package.json packages/dashboard/
RUN bun install --frozen-lockfile || bun install

# source
COPY . .

# build the dashboard (produces packages/dashboard/.output)
RUN bun run --filter @modmail/dashboard build

EXPOSE 3000 4000

# Default: run the bot. For the dashboard service, override with e.g.:
#   command: ["bun", "packages/dashboard/.output/server/index.mjs"]
CMD ["bun", "run", "--filter", "@modmail/bot", "start"]
