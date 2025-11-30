import type {
  SQLiteTableWithColumns,
  TableConfig,
} from 'drizzle-orm/sqlite-core'

import * as schema from './schema.ts'
import type { drizzle } from 'drizzle-orm/better-sqlite3'

/**
 * This seed file is used for data that should always be in the database, configuration for the application.
 */

// Only 1 isDefault should be set to true
const defaultOrderStatuses: (typeof schema.orderStatusTable.$inferInsert)[] = [
  {
    status: 'Skapad',
    isDefault: true,
    color: 'yellow',
  },
  {
    status: 'Bekräftad',
    color: 'blue',
  },
  {
    status: 'Upphämtad',
    color: 'green',
  },
  {
    status: 'Avbokad',
    color: 'red',
  },
]

export async function addSeedingData(
  db: ReturnType<typeof drizzle<typeof schema>>,
) {
  /**
   * Add seeding data to a table, but only if it's empty.
   */
  async function seedIfEmpty<T extends TableConfig>(
    table: SQLiteTableWithColumns<T>,
    seedingData: {
      [K in keyof {
        [Key in keyof SQLiteTableWithColumns<T>['$inferInsert']]: SQLiteTableWithColumns<T>['$inferInsert'][Key]
      }]: {
        [Key in keyof SQLiteTableWithColumns<T>['$inferInsert']]: SQLiteTableWithColumns<T>['$inferInsert'][Key]
      }[K]
    }[],
  ) {
    if ((await db.$count(table)) === 0) {
      await db.insert(table).values(seedingData)
    }
  }
  await seedIfEmpty(schema.orderStatusTable, defaultOrderStatuses)
}
