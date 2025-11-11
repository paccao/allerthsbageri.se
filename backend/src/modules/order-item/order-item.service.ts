import { db } from '#db/index.ts'
import { orderItemTable } from '#db/schema.ts'

export async function createOrderItems(
  data: Omit<typeof orderItemTable.$inferInsert, 'id'>[],
) {
  const results = await db.insert(orderItemTable).values(data).returning()

  return results
}
