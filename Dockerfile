# syntax=docker/dockerfile:1
FROM node:20

RUN apt-get update && \
    apt-get install -y python3 g++ build-essential python-is-python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

ARG START_COMMAND=dev
ARG FRONT_ENDPOINT="http://localhost:3000"
ARG CORS_ENDPOINT="http://localhost:3000"
ARG BACK_ENDPOINT="http://localhost:7007"

ENV START_COMMAND=$START_COMMAND \
    FRONT_ENDPOINT=$FRONT_ENDPOINT \
    CORS_ENDPOINT=$CORS_ENDPOINT \
    BACK_ENDPOINT=$BACK_ENDPOINT \
    NODE_OPTIONS="${NODE_OPTIONS:-} --no-node-snapshot" \
    LOG_LEVEL=info

WORKDIR backstage

COPY conf conf
COPY src/backstage/. .

RUN corepack enable && corepack prepare yarn@stable --activate
RUN yarn install
RUN yarn workspace backend add \
    @backstage/plugin-catalog-backend-module-azure@0.3.5 \
    @backstage-community/plugin-azure-devops@0.16.0 \
    @backstage-community/plugin-azure-devops-backend@0.17.0 \
    @parfuemerie-douglas/scaffolder-backend-module-azure-pipelines@1.3.0 \
    @backstage/plugin-catalog-backend-module-logs@0.1.10 \
    @roadiehq/scaffolder-backend-module-http-request@5.3.2 \
    @drodil/backstage-plugin-qeta-backend@3.21.0 \
    @backstage-community/plugin-sonarqube-backend@0.10.0 && \
  yarn workspace app add \
    @drodil/backstage-plugin-qeta@3.31.4 \
    @backstage-community/plugin-sonarqube@0.15.0 \
    @backstage-community/plugin-sonarqube-react@0.8.0 && \
  yarn cache clean

RUN pip3 install --break-system-packages mkdocs mkdocs-material mkdocs-techdocs-core

EXPOSE 3000 7007

# Patch config files for dev run
RUN if [ "$START_COMMAND" != "dev" ]; then sed -i '/plugin-app-backend/d' packages/backend/src/index.ts; fi
# Start backstage frontend or backend or both depending on arguments
CMD sh -c '\
  if [ "$START_COMMAND" = "dev" ]; then \
    if test -f app-config.local.yaml; then \
        exec corepack yarn dev --config ../../app-config.yaml --config ../../app-config.local.yaml; \
    else \
        exec corepack yarn dev --config ../../app-config.yaml; \
    fi \
  else \
    exec corepack yarn "$START_COMMAND" --config ../../app-config.yaml --config ../../app-config.production.yaml; \
  fi'
