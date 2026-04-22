FROM node:22-bookworm-slim AS packages

WORKDIR /app

# Copy package management files
COPY backstage.json package.json yarn.lock ./
COPY .yarn ./.yarn
COPY .yarnrc.yml ./

# Copy package directories (will be cleaned below)
COPY packages packages
COPY sodexo sodexo
COPY plugins plugins

# Remove all files except package.json to create a minimal dependency tree
# This allows Docker to cache dependency installation separately from code changes
RUN find packages \! -name "package.json" -mindepth 2 -maxdepth 2 -exec rm -rf {} \+

# Build application
FROM node:22-bookworm-slim AS build

# Install system dependencies required for native Node.js modules
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        g++ \
        build-essential \
        libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

# Set Python interpreter for node-gyp
ENV PYTHON=/usr/bin/python3

WORKDIR /app

# Copy package skeleton from stage 1 and set proper ownership
COPY --from=packages --chown=node:node /app .

# Ensure node user owns the entire /app directory before switching users
RUN chown -R node:node /app

# Switch to non-root user for security
USER node

# Install all dependencies (including devDependencies for building)
RUN yarn install --immutable

# Copy application source code
COPY --chown=node:node . .

# Compile TypeScript and build backend bundle
RUN yarn tsc
RUN yarn --cwd packages/backend build

# Extract build artifacts for production stage
RUN mkdir packages/backend/dist/skeleton packages/backend/dist/bundle && \
    tar xzf packages/backend/dist/skeleton.tar.gz -C packages/backend/dist/skeleton && \
    tar xzf packages/backend/dist/bundle.tar.gz -C packages/backend/dist/bundle

# Production runtime image
FROM node:22-bookworm-slim

# Install runtime system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        g++ \
        build-essential \
        libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

# Set Python interpreter for node-gyp
ENV PYTHON=/usr/bin/python3

WORKDIR /app

# Ensure proper ownership before switching to node user
RUN chown -R node:node /app

# Run as non-root user for security
USER node

# Copy Yarn configuration and package skeleton
COPY --from=build --chown=node:node /app/.yarn ./.yarn
COPY --from=build --chown=node:node /app/.yarnrc.yml ./
COPY --from=build --chown=node:node /app/backstage.json ./
COPY --from=build --chown=node:node /app/yarn.lock /app/package.json /app/packages/backend/dist/skeleton/ ./

# Install production dependencies only and clean cache
RUN yarn workspaces focus --all --production && \
    rm -rf "$(yarn cache clean)"

# Copy built application bundle
COPY --from=build --chown=node:node /app/packages/backend/dist/bundle/ ./

# Copy runtime configuration files
COPY --chown=node:node app-config*.yaml ./
COPY --chown=node:node catalog-entities ./catalog-entities

# Copy Sodexo custom assets
COPY --chown=node:node sodexo ./sodexo

# Create certs directory — certificates are injected at runtime via
# WEBAPP_CLIENT_CERT / WEBAPP_CLIENT_KEY env vars (sourced from Key Vault)
RUN mkdir -p /app/certs

# Set production environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--no-node-snapshot" \
    LOG_LEVEL=info

# Runtime configuration arguments (can be overridden at build time)
ARG FRONT_ENDPOINT="http://localhost:7007"
ARG CORS_ENDPOINT="http://localhost:7007"
ARG BACK_ENDPOINT="http://localhost:7007"

# Expose runtime environment variables
ENV FRONT_ENDPOINT=$FRONT_ENDPOINT \
    CORS_ENDPOINT=$CORS_ENDPOINT \
    BACK_ENDPOINT=$BACK_ENDPOINT

# Expose backend port (serves both API and frontend in production)
EXPOSE 7007

# Start Backstage backend
# - Write mTLS certs from env vars (Key Vault secrets) to disk before startup
# - If USE_PRODUCTION_CONFIG=true (default): Uses PostgreSQL (app-config.production.yaml)
# - If USE_PRODUCTION_CONFIG=false: Uses SQLite for local testing (app-config.yaml only)
CMD sh -c '\
  if [ -n "$WEBAPP_CLIENT_CERT" ]; then printf "%s" "$WEBAPP_CLIENT_CERT" > /app/certs/client.pem; fi && \
  if [ -n "$WEBAPP_CLIENT_KEY" ]; then printf "%s" "$WEBAPP_CLIENT_KEY" > /app/certs/client-key.pem; fi && \
  if [ "$USE_PRODUCTION_CONFIG" = "true" ]; then \
    exec node packages/backend --config app-config.yaml --config app-config.production.yaml; \
  else \
    exec node packages/backend --config app-config.yaml --config app-config.sandbox.yaml; \
  fi'
