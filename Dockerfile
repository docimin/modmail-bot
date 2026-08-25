# Bun-only image for the whole monorepo. Run the bot and the dashboard as two
# services (override the command per service in compose / your orchestrator).
FROM oven/bun:1 AS manifests
WORKDIR /app
COPY package.json bun.lock ./
COPY packages/db/package.json packages/db/
COPY packages/core/package.json packages/core/
COPY packages/bot/package.json packages/bot/
COPY packages/dashboard/package.json packages/dashboard/

FROM manifests AS deps
RUN bun install --frozen-lockfile

FROM manifests AS prod-deps
RUN bun install --frozen-lockfile --production

FROM deps AS build
COPY . .
RUN bun run --filter @modmail/dashboard build

FROM oven/bun:1 AS runtime
WORKDIR /app
ENV NODE_ENV=production

# root store plus the per-workspace link trees bun creates
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=prod-deps /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=prod-deps /app/packages/bot/node_modules ./packages/bot/node_modules

COPY --from=build /app/packages/dashboard/.output ./packages/dashboard/.output
COPY package.json bun.lock ./
COPY packages/db ./packages/db
COPY packages/core ./packages/core
COPY packages/bot ./packages/bot
COPY packages/dashboard/package.json ./packages/dashboard/package.json

USER bun
EXPOSE 3000 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.INTERNAL_API_PORT??4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Default: run the bot. For the dashboard service, override with e.g.:
#   command: ["bun", "packages/dashboard/.output/server/index.mjs"]
CMD ["bun", "run", "--filter", "@modmail/bot", "start"]
