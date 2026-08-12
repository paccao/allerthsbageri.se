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
    && npm i -g corepack@latest \
    && corepack enable \
    && corepack use pnpm@10.34.4

FROM base AS builder
ENV CI=true
ARG PUBLIC_PASSWORD
ARG PUBLIC_PAYLOAD
ARG EMAIL
WORKDIR $APP_PATH
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
WORKDIR $APP_PATH/frontend
COPY frontend/package.json ./
RUN pnpm --filter=frontend install --frozen-lockfile --engine-strict
COPY frontend .
RUN echo "EMAIL=${EMAIL}" >> .env \
    echo "PUBLIC_PASSWORD=${PUBLIC_PASSWORD}" >> .env \
    echo "PUBLIC_PAYLOAD=${PUBLIC_PAYLOAD}" >> .env
RUN pnpm build

FROM base AS app
WORKDIR $APP_PATH
COPY --from=builder --chown=$USERNAME:$USERNAME $APP_PATH/frontend/build build/
COPY --from=builder --chown=$USERNAME:$USERNAME $APP_PATH/frontend/package.json ./
COPY --from=builder --chown=$USERNAME:$USERNAME $APP_PATH/frontend/.env ./
COPY --from=builder --chown=$USERNAME:$USERNAME $APP_PATH/pnpm-lock.yaml ./
RUN pnpm --filter=frontend install --prod
RUN corepack disable \
    && npm uninstall -g corepack \
    && rm -rf pnpm/ \
    && chown -R $USERNAME:$USERNAME node_modules/
ENV NODE_ENV=production
# Origin is required for sveltekit fetch to work
ENV ORIGIN=http://localhost:3000
USER $USERNAME
EXPOSE 3000
CMD [ "node", "build"]
