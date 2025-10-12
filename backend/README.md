# Allerths bageri backend

## Setup your development env

Install [Node.js 22](https://nodejs.org/) and [pnpm 10](https://pnpm.io/).

```sh
git clone https://github.com/paccao/allerthsbageri.se.git && \
cd allerthsbageri.se/backend && \
pnpm i
```

### Setup Env file

1. Make a copy of `.env.example` and name it `.env`.
2. Nothing else needed for the dev environment, modify as needed for other environments.

### Setup database first time

```sh
pnpm run db push && pnpm run db:seed
```

### Run backend

```sh
pnpm dev
```

## Upgrade dependencies

```sh
pnpm outdated
pnpm up
```

## Test github workflow locally

1. Install docker rootless https://docs.docker.com/engine/security/rootless/
2. Install nektos/act https://github.com/nektos/act

Act lets you test github workflows locally

3. Run act:

```sh
act --workflows ".github/workflows/test-backend.yaml" \
    --container-architecture linux/amd64 \
    -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:runner-24.04
```
