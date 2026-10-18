FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates util-linux && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY scripts ./scripts
COPY lib ./lib
COPY dev-space/ad-networks-niche/rubric.md ./dev-space/ad-networks-niche/rubric.md
USER node
ENV NODE_NO_WARNINGS=1 NODE_OPTIONS=--max-old-space-size=640
CMD ["flock", "--nonblock", "--conflict-exit-code", "75", "/data/state/scheduler.lock", "node", "--experimental-strip-types", "scripts/ad-networks/runtime.mjs"]
