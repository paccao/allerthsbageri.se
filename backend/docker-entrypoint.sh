#!/bin/sh
set -e

# Only run migrations/seed if the database doesn't exist
if [ ! -f /app/data/prod.db ]; then
  echo "Database not found. Initializing..."
  npm run db:prod
else
  echo "Database found. Skipping initialization."
fi

# Start the app
exec "$@"
