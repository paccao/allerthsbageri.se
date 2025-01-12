import { exec } from 'child_process'
import { rm } from 'fs/promises'
import { resolve } from 'path'
import { promisify } from 'util'

import apiConfig from '#config/api.ts'

const execAsync = promisify(exec)

/**
 * Perform some test setup before each test run.
 */
async function setup() {
  console.log('🧪 Preparing to run tests...')
  if (!apiConfig.env.TEST) throw new Error('Ensure NODE_ENV is set to testing')

  // Clear results from the previous test run
  await rm(resolve(apiConfig.dbConnection), { force: true })

  // Create a new test DB, push the schema, and seed it with common data
  await execAsync('node --run db -- push', { env: process.env })
  await execAsync(
    'node --no-warnings=ExperimentalWarning --experimental-strip-types --experimental-transform-types src/db/seed.ts',
    { env: process.env },
  )
}

await setup()
