import { drizzle } from 'drizzle-orm/better-sqlite3'
import { pushSQLiteSchema } from 'drizzle-kit/api'

import apiConfig from '#config/api.ts'
import * as schema from '#db/schema.ts'
import { addSeedingData } from './seed.ts'

if (!apiConfig.env.TEST) {
  throw new Error('This module should only be used for tests')
}

function convertCamelToSnakeCase(str: string) {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1_').toLowerCase()
}

/**
 * Format to ensure snake_case is used for all column names in a Drizzle SQLite migration.
 */
function formatSQLWithSnakeCaseColumnNames(rawSQL: string) {
  // Since all column names are wrapped in backticks, we can replace any non-whitespace characters
  // and convert camelCase to snake_case.
  return rawSQL.replaceAll(/\`\S+\`/g, (columnName) =>
    convertCamelToSnakeCase(columnName),
  )
}

/**
 * Create a testing DB.
 *
 * @returns DB instance which should be passed to the dependency container to oveerride the default DB during tests.
 */
export async function createInMemoryTestDB() {
  const db = drizzle({
    connection: { source: ':memory:' },
    casing: 'snake_case',
    schema,
  })

  let originalWrite = process.stdout.write.bind(process.stdout)

  /** @ts-expect-error Mock implementation to temporarily ignore unwanted output */
  process.stdout.write = (_chunk, _encoding, callback) => {
    callback?.()
    return true
  }

  // Use the latest DB schema to generate a SQL migration for our empty testing DB
  const { statementsToExecute } = await pushSQLiteSchema(schema, db as any)

  process.stdout.write = originalWrite

  const migration = formatSQLWithSnakeCaseColumnNames(
    statementsToExecute.join('\n'),
  )
  db.$client.exec(migration)

  await addSeedingData(db)

  return db
}
