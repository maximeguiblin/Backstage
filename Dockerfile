# syntax=docker/dockerfile:1
FROM node:20

RUN apt-get update && \
    apt-get install -y python3 g++ build-essential python-is-python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY src/backstage/package.json src/backstage/yarn.lock src/backstage/.yarnrc.yml ./
COPY src/backstage/.yarn .yarn

RUN corepack enable && corepack prepare yarn@stable --activate
RUN yarn install

COPY src/backstage .

# --- Add extra plugins in a single layer ---
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

# --- Python deps ---
RUN pip3 install --break-system-packages mkdocs mkdocs-material mkdocs-techdocs-core

EXPOSE 3000 7007

ENV START_COMMAND=dev \
    FRONT_ENDPOINT=http://localhost:3000 \
    CORS_ENDPOINT=http://localhost:3000 \
    BACK_ENDPOINT=http://localhost:7007 \
    LOG_LEVEL=debug

CMD ["sh", "-c", "if [ \"$START_COMMAND\" = \"dev\" ]; then yarn dev --config ../../app-config.yaml; else yarn \"$START_COMMAND\" --config ../../app-config.yaml --config ../../app-config.production.yaml; fi"]
