import type {
  SQLiteTableWithColumns,
  TableConfig,
} from 'drizzle-orm/sqlite-core'

import { db } from './index.ts'
import { orderStatusTable } from './schema.ts'
import type { CreateOrderStatusSchema } from '#src/modules/order-status/order-status.schemas.ts'

/**
 * This seed file is used for data that should always be in the database, configuration for the application.
 */

// Only 1 isDefault should be set to true
const defaultOrderStatuses: CreateOrderStatusSchema[] = [
  {
    status: 'Bokad',
    isDefault: true,
    color: 'yellow',
  },
  {
    status: 'Bekräftad',
    isDefault: false,
    color: 'blue',
  },
  {
    status: 'Upphämtad',
    isDefault: false,
    color: 'green',
  },
  {
    status: 'Avbokad',
    isDefault: false,
    color: 'red',
  },
]

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

async function main() {
  await seedIfEmpty(orderStatusTable, defaultOrderStatuses)

  console.log(`🌱 Successfully seeded the database`)
}

await main().catch((e) => {
  console.error(e)
  process.exit(1)
})
