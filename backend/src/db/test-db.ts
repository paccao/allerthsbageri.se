import { mock } from 'node:test'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { pushSQLiteSchema } from 'drizzle-kit/api'

import apiConfig from '#config/api.ts'
import * as schema from '#db/schema.ts'
import { addSeedingData } from './seed.ts'

// TODO: Re-enable when done
// if (!apiConfig.env.TEST) {
//   throw new Error('This module should only be used for tests')
// }

export async function setupMockedInMemoryTestDB() {
  const db = drizzle({
    // TODO: Switch back when done
    // connection: { source: apiConfig.dbConnection },
    connection: { source: ':memory:' },
    casing: 'snake_case',
    schema,
  })

  // Use the latest DB schema to generate a SQL migration for our empty testing DB
  const { statementsToExecute } = await pushSQLiteSchema(schema, db as any)

  // TODO: The columns are using `camel_case` instead of `snake_case`
  console.log(statementsToExecute.join('\n'))

  // TODO: Verify if pushSQLiteSchema supports the `casing` option and try to set it to `snake_case`
  // TODO: If that doesn't work, maybe we could manually create the JSON snapshots together with the migration files?
  // I think I saw some of those methods supporting the `casing` option.

  // Apply the migration to the temporary testing DB
  db.$client.exec(statementsToExecute.join('\n'))

  // Add common seeding data which is needed by the application
  // IDEA: What if we add an admin user by default so test suites don't have to do that?
  // However, then we use different
  await addSeedingData(db)

  // TODO: verify the order statuses were seeded as expected. Remove this when done.
  console.log(
    'order statuses:',
    db.select().from(schema.orderStatusTable).all(),
  )

  // TODO: Is it possible to mock the #db/index.ts module directly in here?
  // since it is imported by the same process as the node:test suite
  // OR do we need to create the mock in the suite itself?
  // mock.module('#db/index.ts', { cache: true, namedExports: { db } })
}

await setupMockedInMemoryTestDB()
