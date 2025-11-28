import { mock } from 'node:test'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { pushSQLiteSchema } from 'drizzle-kit/api'

import apiConfig from '#config/api.ts'
import * as schema from '#db/schema.ts'

if (!apiConfig.env.TEST) {
  throw new Error('This module should only be used for tests')
}

export async function setupMockedInMemoryTestDB() {
  // TODO: Is it possible to mock the #db/index.ts module directly in here?
  // since it is imported by the same process as the node:test suite
  // OR do we need to create the mock in the suite itself?

  const db = drizzle({
    connection: { source: apiConfig.dbConnection },
    casing: 'snake_case',
    schema,
  })

  // TODO: Is there a way to push directly to the in-memory DB?
  // Maybe we could use pushSQLiteSchema()?
  // TODO: Search in the Drizzle codebase for pushSQLiteSchema() usage examples
  // Maybe we could use it to easily prepare the in-memory DB
  // However, a more future-proof approach could be to just generate the migration files and run them one statement at a time.
  // One approach to running the statements: https://www.answeroverflow.com/m/1307948769480015883

  // TODO: empty the tmp migrations directory if it exists
  // create tmp dir to create the drizzle-kit "initial" migration.
  // read the tmp file
  // exec migration

  // IDEA: Maybe execute raw SQL
  // db.$client.exec()

  mock.module('#db/index.ts', { cache: true, namedExports: { db } })

  // import the seeding TS script and execute it against the in-memory db instance
}
