import { db } from './index.ts'
import { orderStatusTable } from './schema.ts'

const orderStatuses: (typeof orderStatusTable.$inferInsert)[] = [
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

async function main() {
  // TODO: skip insert if the count of orderStatusTable is > 0
  // If we already have values, there's no need to seed data to that table.

  await db.insert(orderStatusTable).values(orderStatuses)

  // TODO: Add a function to reset the local DB and populate it with seeding data
  // Make it easy to drop specific table(s) and completely reset the DB, including primary keys and similar
  // Easy way is to just delete the DB file and re-create it

  // TODO: seed an admin user to be used for testing

  // TODO: Maybe seed with realistic example data
}

await main().catch((e) => {
  console.error(e)
  process.exit(1)
})
