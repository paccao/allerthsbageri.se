import { hash } from '@node-rs/argon2'

import { createDBConnection } from '#db/index.ts'
import {
  orderStatusTable,
  pickupOccasionTable,
  productDetailsTable,
  productTable,
  userTable,
} from './schema.ts'
import apiConfig from '#config/api.ts'
import env from '#config/env.ts'
import { createLogger } from '#utils/logger.ts'
import { createSeedingUtils, defaultOrderStatuses } from './seed.ts'

if (env.NODE_ENV != 'development') {
  throw new Error(
    'The specified seed script should only be run in development.',
  )
}

const db = createDBConnection(createLogger())

/**
 * This seed file is used for testing data in the development environment only.
 */

const defaultPickups: (typeof pickupOccasionTable.$inferInsert)[] = [
  {
    name: 'Brödbakarnas dag',
    location: 'Stora torget, Borås',
    orderStart: new Date('2025-08-23T08:00:00.000Z').toISOString(),
    orderEnd: new Date('2025-08-28T17:00:00.000Z').toISOString(),
    pickupStart: new Date('2025-08-29T09:00:00.000Z').toISOString(),
    pickupEnd: new Date('2025-08-29T15:30:00.000Z').toISOString(),
  },
  {
    name: 'Bäckängsgymnasiets marknad',
    location: 'Lokal marknad på gården utanför Bäckängsgymnasiet',
    orderStart: new Date('2025-09-07T00:00:00.000Z').toISOString(),
    orderEnd: new Date('2025-09-17T23:59:59.999Z').toISOString(),
    pickupStart: new Date('2025-09-07T10:30:00.000Z').toISOString(),
    pickupEnd: new Date('2025-09-07T16:30:00.000Z').toISOString(),
  },
  {
    name: 'Nuvarande',
    location: '1',
    orderStart: new Date('2025-08-23T08:00:00.000Z').toISOString(),
    orderEnd: new Date('2025-08-28T17:00:00.000Z').toISOString(),
    pickupStart: new Date('2026-02-19T09:00:00.000Z').toISOString(),
    pickupEnd: new Date('2100-08-30T15:30:00.000Z').toISOString(),
  },
  {
    name: 'Framtiden',
    location: '2',
    orderStart: new Date('2025-09-07T00:00:00.000Z').toISOString(),
    orderEnd: new Date('2025-09-17T23:59:59.999Z').toISOString(),
    pickupStart: new Date('2100-02-20T10:30:00.000Z').toISOString(),
    pickupEnd: new Date('2700-05-07T16:30:00.000Z').toISOString(),
  },
]

const defaultProductDetails: (typeof productDetailsTable.$inferInsert)[] = [
  {
    name: 'Surdegsbröd med Emmer',
    description: 'Ett surdegsbröd med färskmalen ekologisk kultursäd, Emmer.',
    image: null,
    vatPercentage: 6,
  },
  {
    name: 'Surdegsbröd med rågsikt',
    description: 'Ett surdegsbröd med ekologisk rågsikt',
    image: null,
    vatPercentage: 12,
  },
  {
    name: 'Surdegsbröd med Vänga kvarns samsikt',
    description: 'Detta bröd är bakat med lokalt mjöl från Vänga kvarn',
    image: null,
    vatPercentage: 6,
  },
]

const defaultProducts: (typeof productTable.$inferInsert)[] = [
  {
    stock: 5,
    price: 4000,
    maxPerCustomer: 2,
    pickupOccasionId: 1,
    productDetailsId: 1,
  },
  {
    stock: 15,
    price: 6800,
    maxPerCustomer: 1,
    pickupOccasionId: 1,
    productDetailsId: 2,
  },
  {
    stock: 10,
    price: 5800,
    maxPerCustomer: 2,
    pickupOccasionId: 2,
    productDetailsId: 1,
  },
  {
    stock: 3,
    price: 7000,
    maxPerCustomer: 1,
    pickupOccasionId: 2,
    productDetailsId: 2,
  },
  {
    stock: 22,
    price: 8900,
    maxPerCustomer: 2,
    pickupOccasionId: 2,
    productDetailsId: 3,
  },
]

const defaultUsers = await Promise.all(
  [
    {
      name: 'Admin',
      username: 'seed_admin1',
      password: '123456',
    },
    {
      name: 'bffAdmin',
      username: env.BFF_ADMIN_USERNAME,
      password: env.BFF_ADMIN_PASSWORD,
    },
  ].map(async (u) => {
    const hashedPassword = await hash(
      u.password,
      apiConfig.passwordHashingConfig,
    )
    return { ...u, password: hashedPassword }
  }),
)

async function main() {
  if (env.NODE_ENV != 'development') {
    throw new Error(
      'The specified seed script should only be run in development.',
    )
  }

  const { seedIfEmpty } = createSeedingUtils(db)

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
