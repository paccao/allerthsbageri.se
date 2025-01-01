import { sql } from 'drizzle-orm'

import { db } from './index.ts'

export async function resetDB() {
  const allTables = db.all(
    sql`SELECT name FROM sqlite_master WHERE type='table';`,
  ) as { name: string }[]

  const systemTables = ['sqlite_sequence', '__drizzle_migrations']

  const tables = allTables.filter(({ name }) => !systemTables.includes(name))

  // IMPORTANT: The tables have to be deleted in a specific order because of their relations.
  // Starting with the Tables with few relations and only deleting tables that have many relations at the very end.
  // A bit tedious, but much faster than doing a full prisma reset and re-applying migrations.
  const orderedTables = [
    'customer',
    'order_item',
    'order_status',
    'customer_order',
    'pickup_occasion',
    'product_details',
    'product',
    'session',
    'user',
  ]

  const unknownTables = tables.filter(
    ({ name }) => !orderedTables.includes(name),
  )

  if (unknownTables.length) {
    console.dir(unknownTables, { colors: true, depth: 2 })
    throw new Error(
      'Please add the following unknown tables to the DB reset script (and delete them in the right order):' +
        unknownTables.join(', '),
    )
  }

  try {
    for (const name of orderedTables) {
      db.run(sql`DELETE FROM ${name};`)
      db.run(sql`DELETE FROM sqlite_sequence WHERE name='${name}';`)
    }
  } catch (error) {
    console.log({ error })
  }

  // IDEA: Maybe re-apply seed
}

await resetDB()
