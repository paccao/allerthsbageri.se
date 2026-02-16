FROM node:24-trixie-slim AS base
SHELL ["/usr/bin/bash", "-c"]
ARG USERNAME=node
ENV APP_PATH="/app"

FROM base AS builder
ENV PNPM_VERSION=10.29.2
ENV PNPM_HOME="$APP_PATH/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
WORKDIR "$APP_PATH"
RUN \
    apt-get update \
    # && apt-get upgrade -y --no-install-recommends \
    && npm config set ignore-scripts true \
    && npm i -g npm@latest \
    && npm i -g corepack \
    && corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
WORKDIR $APP_PATH/frontend
COPY frontend/.npmrc frontend/package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter=frontend install --frozen-lockfile
COPY frontend/. .
RUN --mount=type=cache,target=/pnpm/store \
    pnpm build
RUN pnpm prune --prod

FROM base AS app
WORKDIR $APP_PATH
COPY --from=builder $APP_PATH/frontend/build build/
COPY --from=builder $APP_PATH/frontend/node_modules node_modules/
COPY --from=builder $APP_PATH/frontend/package.json ./
COPY frontend/.env build/
EXPOSE 3000
ENV NODE_ENV=production
USER $USERNAME
CMD [ "node", "build"]
