FROM node:24-trixie-slim AS base
SHELL ["/usr/bin/bash", "-c"]
ARG USERNAME=node
ENV APP_PATH="/app"
ENV PNPM_HOME="$APP_PATH/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN \
    apt-get update \
    && apt-get upgrade -y --no-install-recommends \
    && apt-get install -y --no-install-recommends \
        python3 \
        build-essential \
    && rm -rf /var/lib/apt/lists/*
RUN \
    npm config set ignore-scripts true \
    && npm i -g npm@latest \
    && npm i -g corepack@latest \
    && corepack enable \
    && corepack use pnpm@10.34.4

FROM base AS builder
ENV CI=true
ARG BFF_ADMIN_USERNAME
ARG BFF_ADMIN_PASSWORD
ARG BFF_API_KEY
WORKDIR $APP_PATH
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
WORKDIR $APP_PATH/backend/
COPY backend/package.json backend/drizzle.config.ts ./
RUN pnpm --filter=backend install --frozen-lockfile --engine-strict
RUN cd node_modules/better-sqlite3 && \
    pnpm build-release && \
    cd -
COPY backend ./
RUN pnpm build

FROM base as app
WORKDIR $APP_PATH
COPY --from=builder --chown=$USERNAME:$USERNAME $APP_PATH/backend/dist dist/
COPY --from=builder --chown=$USERNAME:$USERNAME $APP_PATH/backend/node_modules ./node_modules
COPY --from=builder --chown=$USERNAME:$USERNAME $APP_PATH/backend/package.json ./
# TEMP FIX: Save the better-sqlite3 build directory before pruning
# See: https://github.com/WiseLibs/better-sqlite3/issues/1378#issuecomment-3912716715
COPY --from=builder --chown=$USERNAME:$USERNAME \
     $APP_PATH/backend/node_modules/better-sqlite3/build \
     /tmp/better-sqlite3-build
RUN npm prune --omit=dev
# Restore the better-sqlite3 build directory
RUN mkdir -p node_modules/better-sqlite3 && \
    cp -r /tmp/better-sqlite3-build node_modules/better-sqlite3/build && \
    rm -rf /tmp/better-sqlite3-build
RUN corepack disable \
    && npm uninstall -g corepack \
    && rm -rf pnpm/ \
    && chown -R $USERNAME:$USERNAME node_modules/
COPY --chown=$USERNAME:$USERNAME backend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENV NODE_ENV=production
USER $USERNAME
EXPOSE 4000

CMD [ "node", "dist/server.js" ]
