FROM node:24-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY patches ./patches

RUN yarn --frozen-lockfile

COPY . .

RUN yarn build

FROM base AS cleaner

WORKDIR /app

COPY package.json yarn.lock ./
COPY patches ./patches

RUN yarn --frozen-lockfile --production
RUN yarn patch

FROM base AS runner

WORKDIR /app

COPY --from=cleaner --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

USER node

CMD ["node", "/app/dist/index.js"]
