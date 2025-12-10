FROM node:20.19.0-bullseye-slim AS builder

WORKDIR /app

ENV TZ Asia/Tokyo

RUN apt-get update && apt-get install -y tzdata openssl curl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production=false --frozen-lockfile --network-timeout 600000

COPY nuxt.config.ts ./
COPY tsconfig.json ./
COPY app ./app
COPY server ./server
RUN yarn run build

FROM node:20.19.0-bullseye-slim

WORKDIR /app

ENV TZ Asia/Tokyo

RUN apt-get update && apt-get install -y tzdata openssl && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/.output /app/.output

EXPOSE 3000

CMD [ "node", "/app/.output/server/index.mjs" ]
