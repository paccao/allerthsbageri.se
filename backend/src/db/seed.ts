import type {
  SQLiteTableWithColumns,
  TableConfig,
} from 'drizzle-orm/sqlite-core'
import { hash } from '@node-rs/argon2'

import { db } from './index.ts'
import {
  orderStatusTable,
  pickupOccasionTable,
  productDetailsTable,
  productTable,
  userTable,
} from './schema.ts'
import apiConfig from '#config/api.ts'

const defaultPickups: (typeof pickupOccasionTable.$inferInsert)[] = [
  {
    id: 1,
    name: 'Brödbakarnas dag',
    description: 'Bröd åt folket',
    bookingStart: new Date('2025-08-23T08:00:00.000Z').toISOString(),
    bookingEnd: new Date('2025-08-28T17:00:00.000Z').toISOString(),
    pickupStart: new Date('2025-08-29T09:00:00.000Z').toISOString(),
    pickupEnd: new Date('2025-08-29T15:30:00.000Z').toISOString(),
  },
  {
    id: 2,
    name: 'Bäckängsgymnasiets marknad',
    description: 'Lokal marknad på gården utanför Bäckängsgymnasiet',
    bookingStart: new Date('2025-09-07T00:00:00.000Z').toISOString(),
    bookingEnd: new Date('2025-09-17T23:59:59.999Z').toISOString(),
    pickupStart: new Date('2025-09-07T10:30:00.000Z').toISOString(),
    pickupEnd: new Date('2025-09-07T16:30:00.000Z').toISOString(),
  },
]

const defaultProductDetails: (typeof productDetailsTable.$inferInsert)[] = [
  {
    id: 1,
    name: 'Surdegsbröd med Emmer',
    location: 'Ett surdegsbröd med färskmalen ekologisk kultursäd, Emmer.',
    image: null,
    vatPercentage: 6,
  },
  {
    id: 2,
    name: 'Surdegsbröd med rågsikt',
    location: 'Ett surdegsbröd med ekologisk rågsikt',
    image: null,
    vatPercentage: 12,
  },
  {
    id: 3,
    name: 'Surdegsbröd med Vänga kvarns samsikt',
    location: 'Detta bröd är bakat med lokalt mjöl från Vänga kvarn',
    image: null,
    vatPercentage: 6,
  },
]

const defaultProducts: (typeof productTable.$inferInsert)[] = [
  {
    id: 1,
    stock: 5,
    price: 1400n,
    maxPerCustomer: 2,
    pickupOccasionId: 1,
    productDetailsId: 1,
  },
  {
    id: 2,
    stock: 15,
    price: 700n,
    maxPerCustomer: 1,
    pickupOccasionId: 1,
    productDetailsId: 2,
  },
  {
    id: 3,
    stock: 10,
    price: 1400n,
    maxPerCustomer: 2,
    pickupOccasionId: 2,
    productDetailsId: 1,
  },
  {
    id: 4,
    stock: 3,
    price: 700n,
    maxPerCustomer: 1,
    pickupOccasionId: 2,
    productDetailsId: 2,
  },
  {
    id: 5,
    stock: 22,
    price: 1100n,
    maxPerCustomer: 2,
    pickupOccasionId: 2,
    productDetailsId: 3,
  },
]

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
      username: 'seed_admin1',
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
  await seedIfEmpty(pickupOccasionTable, defaultPickups)
  await seedIfEmpty(productDetailsTable, defaultProductDetails)
  await seedIfEmpty(productTable, defaultProducts)

  console.log(`🌱 Successfully seeded the database`)
}

await main().catch((e) => {
  console.error(e)
  process.exit(1)
})
