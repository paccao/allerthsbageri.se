import { db } from '#db/index.ts'
import { orderTable, orderItemTable, productTable } from '#db/schema.ts'
import { eq, inArray } from 'drizzle-orm'
import type { Product } from '../product/product.schemas.ts'

type OrderedProduct = Omit<Product, 'productDetailsId'>

export function createOrder(
  order: typeof orderTable.$inferInsert,
  orderItems: Pick<typeof orderItemTable.$inferInsert, 'count' | 'productId'>[],
) {
  return db.transaction(async (tx) => {
    // Get the ordered product and store them as a record for quick lookups
    const products: Record<OrderedProduct['id'], OrderedProduct> = (
      await tx
        .select({
          id: productTable.id,
          pickupOccasionId: productTable.pickupOccasionId,
          maxPerCustomer: productTable.maxPerCustomer,
          stock: productTable.stock,
          price: productTable.price,
        })
        .from(productTable)
        .where(
          inArray(
            productTable,
            orderItems.map(({ productId }) => productId),
          ),
        )
        .execute()
    ).reduce(
      (products, product) => {
        products[product.id] = product
        return products
      },
      {} as Record<OrderedProduct['id'], OrderedProduct>,
    )

    for (const item of orderItems) {
      const product = products[item.productId]
      if (!product) {
        tx.rollback()
        throw new Error('Product not found', { cause: { status: 400 } })
      }

      if (product?.pickupOccasionId !== order.pickupOccasionId) {
        tx.rollback()
        throw new Error(
          'Order items should be from the selected pickup occasion',
          { cause: { status: 400 } },
        )
      }

      if (
        product.maxPerCustomer !== null &&
        item.count > product.maxPerCustomer
      ) {
        tx.rollback()
        throw new Error(
          `Unable to order ${item.count} of product because max per customer is ${product.maxPerCustomer}`,
          { cause: { status: 400, details: { productId: product.id } } },
        )
      }

      if (product.stock < item.count) {
        tx.rollback()
        throw new Error(
          product.stock > 0
            ? `Unable to order ${item.count} of product because only ${product.stock} remains in stock`
            : `Unable to order ${item.count} of product is out of stock`,
          {
            cause: {
              status: 400,
              details: { productId: product.id, stock: product.stock },
            },
          },
        )
      }
    }

    const [createdOrder] = await tx
      .insert(orderTable)
      .values(order)
      .returning()
      .execute()

    if (!createdOrder) {
      tx.rollback()
      throw new Error('Failed to create order', { cause: { status: 500 } })
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
      throw new Error('Failed to create order items', {
        cause: { status: 500 },
      })
    }

    // TODO: Investigate if we need to use another method for updating many rows:
    // https://orm.drizzle.team/docs/guides/update-many-with-different-value
    const updatedProducts = await Promise.all(
      orderItems.map(({ productId, count }) =>
        tx
          .update(productTable)
          .set({ stock: products[productId]!.stock - count })
          .where(eq(productTable.id, productId))
          .execute(),
      ),
    )

    if (updatedProducts.some(({ changes }) => changes === 0)) {
      tx.rollback()
      throw new Error('Failed to update products after', {
        cause: { status: 500 },
      })
    }

    return createdOrder
  })
}
