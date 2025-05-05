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
ENV NODE_OPTIONS="${NODE_OPTIONS:-} --no-node-snapshot"
ENV LOG_LEVEL=debug
RUN corepack enable
RUN corepack yarn install
EXPOSE 3000
EXPOSE 7007
ARG START_COMMAND=dev
ENV START_COMMAND=$START_COMMAND
ARG FRONT_ENDPOINT="0.0.0.0:3000"
ENV CORS_ENDPOINT="https://$FRONT_ENDPOINT"
ENV FRONT_ENDPOINT="http://$FRONT_ENDPOINT"
ARG BACK_ENDPOINT="0.0.0.0:7007"
ENV BACK_ENDPOINT="http://$BACK_ENDPOINT"
RUN corepack yarn --cwd packages/backend add @backstage/plugin-catalog-backend-module-azure
RUN if [ "$START_COMMAND" != "dev" ]; then sed -i '/plugin-app-backend/d' packages/backend/src/index.ts; fi
CMD sh -c "corepack yarn $START_COMMAND"
