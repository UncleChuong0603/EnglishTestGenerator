FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

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
