import { db } from '#db/index.ts'
import { orderStatusTable } from '#db/schema.ts'

export async function createOrderStatus(
  data: typeof orderStatusTable.$inferInsert,
) {
  const results = await db.insert(orderStatusTable).values(data).returning()

  return results[0]
}
