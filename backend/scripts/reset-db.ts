import { fileURLToPath } from 'node:url'
import { sql } from 'drizzle-orm'

import { db } from '#db/index.ts'

async function resetDB() {
  const allTables = (
    db.all(sql`SELECT name FROM sqlite_master WHERE type='table';`) as {
      name: string
    }[]
  ).map(({ name }) => name)

  const systemTables = ['sqlite_sequence', '__drizzle_migrations']

  const tables = allTables.filter((name) => !systemTables.includes(name))

  // IMPORTANT: The tables have to be deleted in a specific order because of their relations.
  // Starting with the Tables with few relations and only deleting tables that have many relations at the very end.
  // A bit tedious, but much faster than doing a full reset and re-applying migrations.
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

  const unknownTables = tables.filter((name) => !orderedTables.includes(name))

  if (unknownTables.length) {
    throw new Error(
      'Please add the following unknown tables to the DB reset script (and delete them in the right order):' +
        unknownTables.join(', '),
    )
  }

  try {
    const hasSequences = db.get(
      sql`SELECT 1 FROM sqlite_master WHERE type='table' AND name='sqlite_sequence';`,
    )

    for (const name of orderedTables) {
      db.$client.exec(`DELETE FROM ${name};`)

      if (hasSequences) {
        db.$client.exec(`DELETE FROM sqlite_sequence WHERE name=${name};`)
      }
    }
  } catch (error) {
    console.log({ error })
  }
}

// Checks if this script was executed directly to prevent accidental DB resets in prod
if (import.meta.url.startsWith('file:')) {
  const modulePath = fileURLToPath(import.meta.url)
  if (process.argv[1] === modulePath) {
    await resetDB()
  }
}
