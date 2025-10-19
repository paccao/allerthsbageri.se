import { db } from '#db/index.ts'
import { customerOrderTable } from '#db/schema.ts'

export async function createCustomerOrder(
  data: typeof customerOrderTable.$inferInsert,
) {
  const results = await db.insert(customerOrderTable).values(data).returning()

  return results[0]
}
