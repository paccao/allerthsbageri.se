# Based on https://github.com/devcontainers/images/blob/main/src/javascript-node/.devcontainer/Dockerfile
# MIT License
ARG VARIANT=24-trixie
FROM node:24-trixie-slim

ARG USERNAME=node
ARG NPM_GLOBAL=/usr/local/share/npm-global

# Add NPM global to PATH.
ENV PATH=${NPM_GLOBAL}/bin:${PATH}
ENV PNPM_VERSION=10.28.2

RUN \
    apt-get update && apt-get -y install --no-install-recommends curl

RUN \
    # Configure global npm install location, use group to adapt to UID/GID changes
    if ! cat /etc/group | grep -e "^npm:" > /dev/null 2>&1; then groupadd -r npm; fi \
    && usermod -a -G npm ${USERNAME} \
    && umask 0002 \
    && mkdir -p ${NPM_GLOBAL} \
    && touch /usr/local/etc/npmrc \
    && chown ${USERNAME}:npm ${NPM_GLOBAL} /usr/local/etc/npmrc \
    && chmod g+s ${NPM_GLOBAL} \
    && npm config -g set prefix ${NPM_GLOBAL} \
    && su ${USERNAME} -c "npm config -g set prefix ${NPM_GLOBAL}" \
    && curl -fsSL https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -

# Fixing vulnerability issue by upgrading svn to 1.14.5. Ref https://subversion.apache.org/security/CVE-2024-46901-advisory.txt
# COPY ./scripts/install-subversion.sh /tmp/install-subversion.sh
# RUN chmod +x /tmp/install-subversion.sh
# RUN /tmp/install-subversion.sh \
#   && rm -f /tmp/install-subversion.sh

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

# Cleanup
RUN apt-get remove -y curl

# Testing
RUN sleep 3000
