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
