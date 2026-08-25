FROM node:24-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 node-app
COPY --from=build --chown=node-app:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=node-app:nodejs /app/dist ./dist
COPY --from=build --chown=node-app:nodejs /app/prisma ./prisma
COPY --from=build --chown=node-app:nodejs /app/package.json ./
USER node-app
EXPOSE 4000
ENV PORT=4000
# Apply pending migrations, then start.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
