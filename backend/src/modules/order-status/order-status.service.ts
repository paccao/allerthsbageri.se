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

export async function getDefaultOrderStatus() {
  const defaultStatus = await db
    .select()
    .from(orderStatusTable)
    .where(eq(orderStatusTable.isDefault, true))

  if (defaultStatus.length > 1) {
    // IDEA: use custom error to allow setting HTTP 500 status code
    throw new Error('More than one default order status found', {
      cause: { defaultStatus },
    })
  }

  if (defaultStatus[0]) {
    return defaultStatus[0]
  }

  throw new Error('No default order status found', { cause: { defaultStatus } })
}

/**
 * Get an order status and fallback to default if it does not exist or the id was missing
 */
export async function getOrderStatusOrDefault(id?: number) {
  if (!id) return getDefaultOrderStatus()

  let orderStatus = await getOrderStatus(id)
  console.warn(`orderStatus not found: ${id}. Falling back to default`)
  if (orderStatus) return orderStatus

  return getDefaultOrderStatus()
}
