FROM node:20

RUN apt-get update
RUN apt-get install -y python3 g++ build-essential python-is-python3

WORKDIR workspace
COPY conf conf
COPY src/backstage backstage

# Uncomment this to run the Python code
# ARG PIP_EXTRA_INDEX_URL="https://sdxcloud.pkgs.visualstudio.com/_packaging/AIP-feed/pypi/simple/aipsdk-core/"
# ENV PIP_EXTRA_INDEX_URL=$PIP_EXTRA_INDEX_URL
# COPY scripts scripts
# COPY pyproject.toml poetry.lock ./
# RUN bash scripts/install_requirements.sh --no_venv --python_version 3.10
# ENV RUN_MODE="live"
# ARG AIP_LOGGER_SOURCE="docker"
# ENV AIP_LOGGER_SOURCE=$AIP_LOGGER_SOURCE
# CMD ["python", "backstage/user_code_app.py"]

# Uncomment this to run the Node code
WORKDIR backstage
# Initialize and install yarn dependencies
ENV NODE_OPTIONS="${NODE_OPTIONS:-} --no-node-snapshot"
ENV LOG_LEVEL=debug
RUN corepack enable
RUN corepack yarn install
# Expose ports
EXPOSE 3000
EXPOSE 7007
# Initialize docker arguments
ARG START_COMMAND=dev
ARG FRONT_ENDPOINT="http://localhost:3000"
ARG CORS_ENDPOINT="http://localhost:3000"
ARG BACK_ENDPOINT="http://localhost:7007"
# Set env vars
ENV START_COMMAND=$START_COMMAND
ENV FRONT_ENDPOINT=$FRONT_ENDPOINT
ENV CORS_ENDPOINT=$CORS_ENDPOINT
ENV BACK_ENDPOINT=$BACK_ENDPOINT
# Install backend plugins
RUN corepack yarn --cwd packages/backend add @backstage/plugin-catalog-backend-module-azure@0.3.5
RUN corepack yarn --cwd packages/backend add @backstage-community/plugin-azure-devops@0.16.0
RUN corepack yarn --cwd packages/backend add @backstage-community/plugin-azure-devops-backend@0.17.0
RUN corepack yarn --cwd packages/backend add @parfuemerie-douglas/scaffolder-backend-module-azure-pipelines@1.3.0
RUN corepack yarn --cwd packages/backend add @backstage/plugin-catalog-backend-module-logs@0.1.10
RUN corepack yarn --cwd packages/backend add @roadiehq/scaffolder-backend-module-http-request@5.3.2
RUN corepack yarn --cwd packages/backend add @drodil/backstage-plugin-qeta-backend@3.21.0
RUN corepack yarn --cwd packages/backend add @backstage-community/plugin-sonarqube-backend@0.9.0
# Install app plugins
RUN corepack yarn --cwd packages/app add @drodil/backstage-plugin-qeta@3.31.4
RUN corepack yarn --cwd packages/app add @backstage-community/plugin-sonarqube@0.14.0
RUN corepack yarn --cwd packages/app add @backstage-community/plugin-sonarqube-react@0.7.0

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
