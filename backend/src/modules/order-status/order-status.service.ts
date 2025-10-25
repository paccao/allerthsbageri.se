import { db } from '#db/index.ts'
import { orderStatusTable } from '#db/schema.ts'
import { eq } from 'drizzle-orm'

const orderStatuses = await db
  .select({ isDefault: orderStatusTable.isDefault })
  .from(orderStatusTable)
  .where(eq(orderStatusTable.isDefault, true))

if (orderStatuses.length > 1 || orderStatuses.length === 0) {
  console.error(
    "Database config error: OrderStatus table - Expected exactly 1 isDefault value set to 'true'.",
  )
  process.exit(1)
}

export async function getOrderStatusById(id: number) {
  const results = await db
    .select()
    .from(orderStatusTable)
    .where(eq(orderStatusTable.id, id))

  return results[0]
}

export async function listOrderStatuses() {
  return await db.select().from(orderStatusTable)
}

export async function createOrderStatus(
  data: typeof orderStatusTable.$inferInsert,
) {
  const results = await db.insert(orderStatusTable).values(data).returning()

  return results[0]
}

export async function updateOrderStatus(
  id: number,
  data: Partial<typeof orderStatusTable.$inferInsert>,
) {
  const results = await db
    .update(orderStatusTable)
    .set(data)
    .where(eq(orderStatusTable.id, id))
    .returning()

  return results[0]
}
