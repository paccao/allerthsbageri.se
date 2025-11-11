import { db } from '#db/index.ts'
import { orderTable } from '#db/schema.ts'

export async function createOrder(data: typeof orderTable.$inferInsert) {
  const results = await db.insert(orderTable).values(data).returning()

  return results[0]!
}
