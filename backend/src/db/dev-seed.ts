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

/**
 * Add a number of days to the testing data
 */
function addDays(days: number, date: Date = new Date()) {
  const result = date
  result.setDate(result.getDate() + days)
  return result
}

const defaultPickups: (typeof pickupOccasionTable.$inferInsert)[] = [
  {
    name: 'Brödbakarnas dag',
    location: 'Stora torget, Borås',
    orderStart: new Date().toISOString(),
    orderEnd: addDays(14).toISOString(),
    pickupStart: addDays(18).toISOString(),
    pickupEnd: addDays(19).toISOString(),
  },
  {
    name: 'Bäckängsgymnasiets marknad',
    location: 'Lokal marknad på gården utanför Bäckängsgymnasiet',
    orderStart: new Date().toISOString(),
    orderEnd: addDays(20).toISOString(),
    pickupStart: addDays(23).toISOString(),
    pickupEnd: addDays(24).toISOString(),
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
