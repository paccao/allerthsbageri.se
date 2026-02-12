# Based on https://github.com/devcontainers/images/blob/main/src/javascript-node/.devcontainer/Dockerfile # MIT License

FROM node:24-trixie-slim
SHELL ["/usr/bin/bash", "-c"]

ARG USERNAME=node
ARG NPM_GLOBAL=/usr/local/share/npm-global

# Fixes random errors with debconf and installing packages
ARG DEBIAN_FRONTEND=noninteractive
ARG TZ=Europe/Amsterdam
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Add NPM global to PATH
ENV PATH=${NPM_GLOBAL}/bin:${PATH}
ENV HOME="/home/$USERNAME"
ENV ENV="$HOME/.bashrc"
ENV PNPM_VERSION=10.29.2
ENV PNPM_HOME="$HOME/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install additional OS packages.
RUN \
    apt-get update \
    && apt-get -y install --no-install-recommends \
    # base system
    net-tools \
    # dev tools
    git

RUN \
    # Configure global npm install location, use group to adapt to UID/GID changes
    if ! cat /etc/group | grep -e "^npm:" > /dev/null 2>&1; then groupadd -r npm; fi \
    && usermod -a -G npm ${USERNAME} \
    && umask 0002 \
    && mkdir -p ${NPM_GLOBAL} \
    && touch $HOME/.npmrc \
    && chown ${USERNAME}:npm ${NPM_GLOBAL} $HOME/.npmrc \
    && chmod g+s ${NPM_GLOBAL} \
    && npm config -g set prefix ${NPM_GLOBAL} \
    && chown ${USERNAME} -c "/home/$USERNAME/.npm/" \
    && npm config set ignore-scripts true \
    && npm i -g npm@latest

RUN \
    npm i -g corepack \
    && corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate
# && pnpm prune

# install playwright
RUN \
    su $USERNAME -c "pnpm add -g playwright" \
    && playwright install --with-deps chromium firefox webkit

USER $USERNAME

# Extra config
RUN \
    echo 'alias l="ls --group-directories-first -AlhF"' >> $ENV \
    # setup node as $USERNAME user
    && npm config set ignore-scripts true \
    # setup git
    && git config --global push.autoSetupRemote true \
    && git config --global init.defaultBranch main

WORKDIR $HOME

# COPY --from=root-dir pnpm-lock.yaml .
# COPY --from=root-dir package.json .
