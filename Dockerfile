FROM node:24-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
ARG STACK127_BUILD_SHA=unknown
ENV NEXT_TELEMETRY_DISABLED=1
ENV STACK127_BUILD_SHA=$STACK127_BUILD_SHA
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN printf '%s\n' "$STACK127_BUILD_SHA" > /app/build-sha
RUN npm run build

FROM base AS runner
ARG STACK127_BUILD_SHA=unknown
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV STACK127_BUILD_SHA=$STACK127_BUILD_SHA

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/build-sha ./build-sha

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 CMD node -e "const hosts=[process.env.HOSTNAME,'127.0.0.1','localhost'].filter(Boolean); Promise.any(hosts.map((host)=>fetch('http://' + host + ':3000/api/health').then((res)=>{if(!res.ok)throw new Error(String(res.status));}))).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
