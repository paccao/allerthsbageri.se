import { db } from '#db/index.ts'
import { orderStatusTable } from '#db/schema.ts'
import { eq } from 'drizzle-orm'

export async function getOrderStatus(id: number) {
  const results = await db
    .select()
    .from(orderStatusTable)
    .where(eq(orderStatusTable.id, id))

  return results[0]
}

export async function listOrderStatuses() {
  return await db
    .select()
    .from(orderStatusTable)
    .where(eq(orderStatusTable.isDefault, true))
}
