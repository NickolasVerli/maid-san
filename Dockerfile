FROM node:24-alpine AS base

FROM base AS builder

WORKDIR /app

COPY .yarn .yarn
COPY package.json .yarnrc.yml yarn.lock ./

RUN corepack enable && yarn install --immutable

COPY . .

RUN yarn build

FROM base AS cleaner

WORKDIR /app

COPY .yarn .yarn
COPY package.json .yarnrc.yml yarn.lock ./
COPY patches ./patches

RUN corepack enable && yarn install --immutable
RUN yarn run patch

FROM base AS runner

WORKDIR /app

COPY --from=cleaner --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

USER node

CMD ["node", "/app/dist/index.js"]
