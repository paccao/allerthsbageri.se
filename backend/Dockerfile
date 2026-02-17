FROM node:24-trixie-slim AS base
SHELL ["/usr/bin/bash", "-c"]
ARG USERNAME=node
ENV APP_PATH="/app"
ENV PNPM_HOME="$APP_PATH/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN \
    apt-get update \
    && apt-get upgrade -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*
RUN \
    npm config set ignore-scripts true \
    && npm i -g npm@latest \
    && npm i -g corepack \
    && corepack enable \
    && corepack prepare pnpm --activate

FROM base AS app
ENV CI=true
WORKDIR $APP_PATH
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
WORKDIR $APP_PATH/backend/
COPY backend/. ./
WORKDIR $APP_PATH
RUN pnpm --filter=backend install --prod
RUN \
    # Cleanup
    && rm -rf pnpm/ \
    # Change ownership to non-root
    && chown -R node:node ./*

ENV NODE_ENV=production
USER $USERNAME
EXPOSE 3000
CMD [ "node", "backend/src/server.ts"]
