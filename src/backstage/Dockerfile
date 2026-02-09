# ==============================================================================
# Backstage Multi-Stage Build
# This Dockerfile builds a production-ready Backstage application
# ==============================================================================

# ==============================================================================
# Stage 1: Create package skeleton
# Purpose: Extract package.json files to prepare dependency installation
# ==============================================================================
FROM node:22-bookworm-slim AS packages

WORKDIR /app

# Copy package management files
COPY backstage.json package.json yarn.lock ./
COPY .yarn ./.yarn
COPY .yarnrc.yml ./

# Copy package directories (will be cleaned below)
COPY packages packages
COPY sodexo sodexo

# Uncomment if you have internal plugins
# COPY plugins plugins

# Remove all files except package.json to create a minimal dependency tree
# This allows Docker to cache dependency installation separately from code changes
RUN find packages \! -name "package.json" -mindepth 2 -maxdepth 2 -exec rm -rf {} \+

# ==============================================================================
# Stage 2: Build application
# Purpose: Install dependencies, compile TypeScript, and build backend bundle
# ==============================================================================
FROM node:22-bookworm-slim AS build

# Install system dependencies required for native Node.js modules
# - python3, g++, build-essential: Required by node-gyp for isolate-vm (@backstage/plugin-scaffolder-backend)
# - libsqlite3-dev: Required by better-sqlite3 (can be removed if using PostgreSQL only)
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

# ==============================================================================
# Stage 3: Production runtime image
# Purpose: Minimal production image with only runtime dependencies
# ==============================================================================
FROM node:22-bookworm-slim

# Install runtime system dependencies
# Same as build stage but only needed for running the application
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
# app-config.yaml: Base configuration
# app-config.production.yaml: Production overrides
COPY --chown=node:node app-config*.yaml ./

# Copy Sodexo catalog files and templates
COPY --chown=node:node sodexo ./sodexo

# Set production environment variables
ENV NODE_ENV=production \
    NODE_OPTIONS="--no-node-snapshot" \
    LOG_LEVEL=info

# Runtime configuration arguments (can be overridden at build time)
ARG FRONT_ENDPOINT="http://localhost:7007"
ARG CORS_ENDPOINT="http://localhost:7007"
ARG BACK_ENDPOINT="http://localhost:7007"

# Expose runtime environment variables
# Set USE_PRODUCTION_CONFIG=false for local testing with SQLite
ENV FRONT_ENDPOINT=$FRONT_ENDPOINT \
    CORS_ENDPOINT=$CORS_ENDPOINT \
    BACK_ENDPOINT=$BACK_ENDPOINT

# Expose backend port (serves both API and frontend in production)
EXPOSE 7007

# Start Backstage backend
# - If USE_PRODUCTION_CONFIG=true (default): Uses PostgreSQL (app-config.production.yaml)
# - If USE_PRODUCTION_CONFIG=false: Uses SQLite for local testing (app-config.yaml only)
CMD sh -c 'if [ "$USE_PRODUCTION_CONFIG" = "true" ]; then \
    exec node packages/backend --config app-config.yaml --config app-config.production.yaml; \
  else \
    exec node packages/backend --config app-config.yaml; \
  fi'
