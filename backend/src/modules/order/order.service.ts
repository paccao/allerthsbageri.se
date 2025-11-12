import { db } from '#db/index.ts'
import { orderTable, orderItemTable, productTable } from '#db/schema.ts'
import { eq } from 'drizzle-orm'
import type { Product } from '../product/product.schemas.ts'

export function createOrder(
  order: typeof orderTable.$inferInsert,
  orderItems: Pick<typeof orderItemTable.$inferInsert, 'count' | 'productId'>[],
  products: Record<Product['id'], Product>,
) {
  // TODO: Consider validating the products in the same transaction to reuse the same state for the
  return db.transaction(async (tx) => {
    const [createdOrder] = await tx
      .insert(orderTable)
      .values(order)
      .returning()
      .execute()

    if (!createdOrder) {
      tx.rollback()
      return

      // IDEA: Return detailed error data that can be returned to the client and logged

      // throw new Error('', { cause: { message: '', status: 400, details: { productId: 123312 } } })
    }

    const createdOrderItems = await tx
      .insert(orderItemTable)
      .values(
        orderItems.map((item) => ({
          ...item,
          orderId: createdOrder.id,
          price: products[item.productId]!.price,
        })),
      )
      .execute()

    if (createdOrderItems.changes < 1) {
      tx.rollback()
      return
    }

    const results = await Promise.all(
      orderItems.map(({ productId, count }) =>
        tx
          .update(productTable)
          .set({ stock: products[productId]!.stock - count })
          .where(eq(productTable.id, productId))
          .execute(),
      ),
    )

    if (results.some(({ changes }) => changes === 0)) {
      tx.rollback()
      return
    }

    return createdOrder
  })
}
