# ==============================================================================
# Backstage Multi-Stage Build (Optimized for faster rebuilds)
# ==============================================================================

# ==============================================================================
# Stage 1: Dependencies (cached separately from code)
# ==============================================================================
FROM node:22-bookworm-slim AS deps

# Install build tools for native modules
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        g++ \
        build-essential \
        libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHON=/usr/bin/python3

WORKDIR /app

# Copy package files first (best cache hit rate)
COPY package.json yarn.lock backstage.json .yarnrc.yml ./
COPY .yarn ./.yarn

# Copy package.json from all workspaces
COPY packages packages

# Remove everything except package.json files to minimize context
RUN find packages -type f ! -name "package.json" -delete && \
    find packages -type d -empty -delete

# Install dependencies (cached unless package files change)
RUN yarn install --immutable --network-timeout 600000

# ==============================================================================
# Stage 2: Build application
# ==============================================================================
FROM node:22-bookworm-slim AS build

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        g++ \
        build-essential \
        libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHON=/usr/bin/python3

WORKDIR /app

# Copy dependencies and config from deps stage
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=deps --chown=node:node /app/.yarn ./.yarn
COPY --from=deps --chown=node:node /app/.yarnrc.yml ./
COPY --chown=node:node package.json yarn.lock backstage.json ./

# Copy source code (separate layer - invalidates only when code changes)
COPY --chown=node:node packages ./packages
COPY --chown=node:node sodexo ./sodexo

USER node

# Build (Backstage CLI builds app + backend and produces bundle)
RUN yarn build:all

# Extract build artifacts
RUN mkdir -p packages/backend/dist/skeleton packages/backend/dist/bundle && \
    tar xzf packages/backend/dist/skeleton.tar.gz -C packages/backend/dist/skeleton && \
    tar xzf packages/backend/dist/bundle.tar.gz -C packages/backend/dist/bundle

# ==============================================================================
# Stage 3: Production runtime (minimal image)
# ==============================================================================
FROM node:22-bookworm-slim

# Install only runtime dependencies (no build tools)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files for production install
COPY --from=build --chown=node:node /app/.yarn ./.yarn
COPY --from=build --chown=node:node /app/.yarnrc.yml ./
COPY --from=build --chown=node:node /app/backstage.json ./
COPY --from=build --chown=node:node /app/yarn.lock /app/package.json /app/packages/backend/dist/skeleton/ ./

USER node

# Install production dependencies only
RUN yarn workspaces focus --all --production && yarn cache clean

# Copy built application bundle
COPY --from=build --chown=node:node /app/packages/backend/dist/bundle/ ./

# Copy configuration and catalog files
COPY --chown=node:node app-config*.yaml ./
COPY --chown=node:node sodexo ./sodexo

# Environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--no-node-snapshot" \
    LOG_LEVEL=info \
    USE_PRODUCTION_CONFIG=true

ARG FRONT_ENDPOINT="http://localhost:7007"
ARG CORS_ENDPOINT="http://localhost:7007"
ARG BACK_ENDPOINT="http://localhost:7007"

ENV FRONT_ENDPOINT=$FRONT_ENDPOINT \
    CORS_ENDPOINT=$CORS_ENDPOINT \
    BACK_ENDPOINT=$BACK_ENDPOINT

EXPOSE 7007

# Start Backstage backend (JSON CMD for correct signal handling)
CMD ["sh", "-c", "if [ \"$USE_PRODUCTION_CONFIG\" = \"true\" ]; then exec node packages/backend --config app-config.yaml --config app-config.production.yaml; else exec node packages/backend --config app-config.yaml; fi"]
