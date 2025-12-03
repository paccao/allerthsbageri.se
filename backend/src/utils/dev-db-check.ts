import apiConfig from '#config/api.ts'

if (!apiConfig.env.DEV) {
  throw new Error('This module should only be imported during development')
}

import { styleText } from 'node:util'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { execSync } from 'node:child_process'

/**
 * This ensures the database exists and has a valid schema.
 *
 * Handles the following cases:
 * 1) If the DEV DB exists, and has the latest schema: Start the backend normally.
 * 2) If there are DB schema changes, and a risk of data loss: Abort execution with an error.
 * 3) If the DEV DB is missing: Create it with the latest schema, add seeding data ans start the backend normally.
 *    This handles several scenarios like the first time setup and after perhaps removing/renaming the local dev DB.
 */
async function ensureCorrectDatabaseState() {
  console.log('[dev]: Checking DB schema for changes...')

  // If DB does not exist _before_ pushing the DB schema
  // then we need to add seeding data later
  const shouldAddSeedingData = !existsSync(resolve(apiConfig.dbConnection))

  const dbCheckResult = execSync('node --run db -- push').toString()

  if (/warning|data loss|revert|abort/gi.test(dbCheckResult)) {
    console.error(
      styleText(
        'red',
        '\nSchema changes with potential data loss detected. Please resolve manually:\n',
      ),
    )
    console.error(dbCheckResult + '\n')
    process.exit(0)
  }

  // Add seeding data after we just created the DB.
  // This happens for example when starting with a fresh development environment
  // or after resetting the dev DB.
  if (shouldAddSeedingData) {
    console.log('[dev]: No DB found. Creating a new one with seeding data.')
    execSync('node --run db:seed')
  }
}

ensureCorrectDatabaseState()
