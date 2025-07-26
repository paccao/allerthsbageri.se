# Allerths bageri backend

## Setup your development env

Install [Node.js 22](https://nodejs.org/) and [pnpm 10](https://pnpm.io/).

```sh
git clone https://github.com/paccao/allerthsbageri.se.git && \
cd allerthsbageri.se/backend && \
pnpm i && \
pnpm dev
```

### Setup database first time

```sh
pnpm drizzle-kit push
pnpm drizzle-kit studio
```

## Upgrade dependencies

```sh
pnpm outdated
pnpm up
```

## Setup Env file

1. Make a copy of `.env.example` and name it `.env`.
2. Nothing else needed for the dev environment, modify as needed for other environments.
