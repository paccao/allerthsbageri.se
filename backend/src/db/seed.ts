import type {
  SQLiteTableWithColumns,
  TableConfig,
} from 'drizzle-orm/sqlite-core'
import { hash } from '@node-rs/argon2'

import { db } from './index.ts'
import { orderStatusTable, userTable } from './schema.ts'
import apiConfig from '#config/api.ts'

const defaultOrderStatuses: (typeof orderStatusTable.$inferInsert)[] = [
  {
    status: 'Bokad',
  },
  {
    status: 'Bekräftad',
  },
  {
    status: 'Betald',
  },
  {
    status: 'Upphämtad',
  },
  {
    status: 'Avbokad',
  },
]

const defaultUsers = await Promise.all(
  [
    {
      name: 'Admin',
      username: 'admin',
      password: '123456',
    },
  ].map(async (u) => {
    const hashedPassword = await hash(
      u.password,
      apiConfig.passwordHashingConfig,
    )
    return { ...u, password: hashedPassword }
  }),
)

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
  await seedIfEmpty(userTable, defaultUsers)
  await seedIfEmpty(orderStatusTable, defaultOrderStatuses)

  console.log(`🌱 Successfully seeded the database`)
}

await main().catch((e) => {
  console.error(e)
  process.exit(1)
})
