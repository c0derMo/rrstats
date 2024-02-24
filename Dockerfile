# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.15.0

FROM node:${NODE_VERSION}-slim AS base

ARG PORT=3000

WORKDIR /src

# Build
FROM base AS build

COPY --link package.json package-lock.json .
RUN npm install

COPY --link . .

RUN npm run build
RUN npm prune

# Run
FROM base

ENV NODE_ENV=production
ENV PORT=$PORT

COPY --from=build /src/.output /src/.output

EXPOSE $PORT
VOLUME /rrstats

ENV NUXT_DATABASE=/rrstats/rrstats.db

CMD [ "node", ".output/server/index.mjs" ]