#!/bin/sh
set -e

if [ ! -d "/app/data" ]; then
    mkdir -p /app/data
fi

node dist/db/seed.js

# Start the app
exec "$@"
