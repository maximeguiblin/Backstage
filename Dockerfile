FROM --platform=linux/amd64 python:3.10-slim

# Install gcc and python3-dev
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev

WORKDIR /app

ARG PIP_EXTRA_INDEX_URL="https://sdxcloud.pkgs.visualstudio.com/_packaging/AIP-feed/pypi/simple/aipsdk-core/"
ENV PIP_EXTRA_INDEX_URL=$PIP_EXTRA_INDEX_URL

COPY scripts scripts
COPY pyproject.toml poetry.lock ./
RUN bash scripts/install_requirements.sh --no_venv --python_version 3.10

ARG RUN_MODE="job"
ENV RUN_MODE=$RUN_MODE

ARG AIP_LOGGER_SOURCE="docker"
ENV AIP_LOGGER_SOURCE=$AIP_LOGGER_SOURCE

COPY conf conf
COPY src src
CMD ["python", "src/backstage/user_code_app.py"]
