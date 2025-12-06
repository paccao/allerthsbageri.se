import { type RunResult } from 'better-sqlite3'
import { eq, and, inArray, sql, type SQL } from 'drizzle-orm'

import { orderTable, orderItemTable, productTable } from '#db/schema.ts'
import type { Product } from '../product/product.schemas.ts'
import type { OrderItem } from '../order-item/order-item.schemas.ts'
import type { DependencyContainer } from '#src/di-container.ts'
import type { Transaction } from '#db/index.ts'

type OrderedProduct = Omit<Product, 'productDetailsId'>

/**
 * Rollback a transaction, replacing the less useful TransactionError with a more specific error.
 *
 * @param tx The DB transaction
 * @param error The error that should be returned to API users
 */
function rollbackWithError(tx: Transaction, error: Error): never {
  try {
    tx.rollback()
  } finally {
    throw error
  }
}

export class OrderService {
  #db: DependencyContainer['db']

  constructor(db: DependencyContainer['db']) {
    this.#db = db
  }

  createOrder(
    order: typeof orderTable.$inferInsert,
    orderItems: Pick<
      typeof orderItemTable.$inferInsert,
      'count' | 'productId'
    >[],
  ) {
    return this.#db.transaction((tx) => {
      // To properly validate maxPerCustomer, we need to aggregate all the customer's orders for the same pickup occasion.
      const previousOrders = tx
        .select()
        .from(orderTable)
        .where(
          and(
            eq(orderTable.pickupOccasionId, order.pickupOccasionId),
            eq(orderTable.customerId, order.customerId),
          ),
        )
        .leftJoin(orderItemTable, eq(orderTable.id, orderItemTable.orderId))
        .all()

      // Aggregate previous orders item count per productId in a record
      const previousOrderItems: Record<OrderItem['id'], OrderItem['count']> = {}

      for (const row of previousOrders) {
        const item = row.order_item
        if (!item) continue // a left‑joined row may be null
        const { productId, count } = item

        previousOrderItems[productId] =
          (previousOrderItems[productId] ?? 0) + count
      }

      // Get the ordered product and store them as a record for quick lookups
      const products: Record<OrderedProduct['id'], OrderedProduct> = tx
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
            productTable.id,
            orderItems.map(({ productId }) => productId),
          ),
        )
        .all()
        .reduce(
          (products, product) => {
            products[product.id] = product
            return products
          },
          {} as Record<OrderedProduct['id'], OrderedProduct>,
        )

      let alreadyOrdered
      let totalCount

      for (const item of orderItems) {
        const product = products[item.productId]
        if (!product) {
          return rollbackWithError(
            tx,
            new Error('Product not found', { cause: { status: 400 } }),
          )
        }

        if (product?.pickupOccasionId !== order.pickupOccasionId) {
          return rollbackWithError(
            tx,
            new Error(
              'Order items should be from the selected pickup occasion',
              {
                cause: { status: 400 },
              },
            ),
          )
        }

        alreadyOrdered = previousOrderItems[item.productId] ?? 0
        totalCount = alreadyOrdered + item.count

        if (
          product.maxPerCustomer !== null &&
          totalCount > product.maxPerCustomer
        ) {
          return rollbackWithError(
            tx,
            new Error(
              `Unable to order because total count of orders, ${totalCount}, exceeds max per customer limit: ${product.maxPerCustomer}`,
              { cause: { status: 400, details: { productId: product.id } } },
            ),
          )
        }

        if (product.stock < item.count) {
          return rollbackWithError(
            tx,
            new Error(
              product.stock > 0
                ? `Unable to order ${item.count} of product because only ${product.stock} remains in stock`
                : `Unable to order ${item.count} of product because there is not enough stock`,
              {
                cause: {
                  status: 400,
                  details: { productId: product.id, stock: product.stock },
                },
              },
            ),
          )
        }
      }

      const [createdOrder] = tx
        .insert(orderTable)
        .values(order)
        .returning()
        .all()

      if (!createdOrder) {
        return rollbackWithError(
          tx,
          new Error('Failed to create order', { cause: { status: 500 } }),
        )
      }

      const createdOrderItems = tx
        .insert(orderItemTable)
        .values(
          orderItems.map((item) => ({
            ...item,
            orderId: createdOrder.id,
            price: products[item.productId]!.price,
          })),
        )
        .returning()
        .all()

      if (createdOrderItems.length === 0) {
        return rollbackWithError(
          tx,
          new Error('Failed to create order items', {
            cause: { status: 500 },
          }),
        )
      }

      const updatedProducts = orderItems.map(({ count, productId }) => {
        const product = products[productId]!
        return { ...product, stock: product.stock - count }
      })

      const { changes } = this.#updateProductStocksAfterOrder(
        tx,
        updatedProducts,
      )

      if (changes === 0) {
        return rollbackWithError(
          tx,
          new Error('Failed to update products after creating order', {
            cause: { status: 500 },
          }),
        )
      }

      return createdOrder
    })
  }

  #updateProductStocksAfterOrder(
    tx: Transaction,
    updatedProducts: OrderedProduct[],
  ) {
    if (updatedProducts.length === 0) {
      return { changes: 0 } as RunResult
    }

    const sqlChunks: SQL[] = []
    const ids: OrderedProduct['id'][] = []

    sqlChunks.push(sql`(case`)

    for (const product of updatedProducts) {
      sqlChunks.push(
        sql`when ${productTable.id} = ${product.id} then ${product.stock}`,
      )
      ids.push(product.id)
    }

    sqlChunks.push(sql`end)`)

    const finalSQL: SQL = sql.join(sqlChunks, sql.raw(' '))

    return tx
      .update(productTable)
      .set({ stock: finalSQL })
      .where(inArray(productTable.id, ids))
      .run()
  }
}
