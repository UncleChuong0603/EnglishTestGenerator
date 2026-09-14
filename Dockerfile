# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js embeds the Server Actions encryption key in the build output. BuildKit
# mounts it for this command only, so it is not copied into an image layer.
RUN --mount=type=secret,id=next_server_actions_encryption_key,required=true \
    export NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="$(cat /run/secrets/next_server_actions_encryption_key)"; \
    npm run build

FROM deps AS migrator
WORKDIR /app
COPY drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src/db ./src/db
CMD ["npm", "run", "db:migrate"]

FROM deps AS database-tools
WORKDIR /app
COPY package.json package-lock.json ./
COPY drizzle.config.ts ./
COPY drizzle ./drizzle
COPY scripts ./scripts
COPY src/db ./src/db

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
