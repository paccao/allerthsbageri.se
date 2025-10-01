import { db } from '#db/index.ts'
import { orderTable, productTable } from '#db/schema.ts'
import { eq } from 'drizzle-orm'

export async function createOrder(data: typeof orderTable.$inferInsert) {
  const results = await db.insert(orderTable).values(data).returning()

  return results[0]
}

export async function getProductById(id: number) {
  const results = await db
    .select({ stock: productTable.stock })
    .from(productTable)
    .where(eq(productTable.id, id))

  return results[0]
}