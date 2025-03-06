FROM node:20

RUN apt-get update

RUN apt-get install -y python3 g++ build-essential python-is-python3

ENV LOG_LEVEL=debug
ENV NODE_OPTIONS="${NODE_OPTIONS:-} --no-node-snapshot"

WORKDIR workspace

# RUN npx @backstage/create-app@latest

# RUN cd backstage && yarn dev
