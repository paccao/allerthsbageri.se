FROM node:24-trixie-slim AS base
SHELL ["/usr/bin/bash", "-c"]
ARG USERNAME=node
ENV APP_PATH="/app"
ENV PNPM_HOME="$APP_PATH/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN \
    apt-get update \
    && apt-get upgrade -y --no-install-recommends
RUN \
    npm config set ignore-scripts true \
    && npm i -g npm@latest \
    && npm i -g corepack \
    && corepack enable \
    && corepack prepare pnpm --activate

FROM base AS builder
ENV CI=true
WORKDIR $APP_PATH
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
WORKDIR $APP_PATH/frontend/
COPY frontend/.npmrc frontend/package.json ./
RUN pnpm --filter=frontend install --frozen-lockfile
COPY frontend/. .
RUN pnpm build

FROM base AS app
WORKDIR $APP_PATH
COPY --from=builder --chown=node:node $APP_PATH/frontend/build build/
COPY --from=builder $APP_PATH/frontend/package.json ./
COPY --from=builder $APP_PATH/pnpm-lock.yaml ./
RUN pnpm install --prod
RUN corepack disable \
    && npm uninstall -g corepack
ENV NODE_ENV=production
# Origin is required for sveltekit fetch to work
ENV ORIGIN=http://localhost:3000
USER $USERNAME
EXPOSE 3000
CMD [ "node", "build"]
