import { type RunResult } from 'better-sqlite3'
import { inArray, sql, type SQL } from 'drizzle-orm'

import { db } from '#db/index.ts'
import { orderTable, orderItemTable, productTable } from '#db/schema.ts'
import type { Product } from '../product/product.schemas.ts'

type OrderedProduct = Omit<Product, 'productDetailsId'>

export function createOrder(
  order: typeof orderTable.$inferInsert,
  orderItems: Pick<typeof orderItemTable.$inferInsert, 'count' | 'productId'>[],
) {
  return db.transaction((tx) => {
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

    const [createdOrder] = tx.insert(orderTable).values(order).returning().all()

    if (!createdOrder) {
      tx.rollback()
      throw new Error('Failed to create order', { cause: { status: 500 } })
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
      tx.rollback()
      throw new Error('Failed to create order items', {
        cause: { status: 500 },
      })
    }

    const updatedProducts = orderItems.map(({ count, productId }) => {
      const product = products[productId]!
      return { ...product, stock: product.stock - count }
    })

    const { changes } = updateProductStocksAfterOrder(tx, updatedProducts)

    if (changes === 0) {
      tx.rollback()
      throw new Error('Failed to update products after creating order', {
        cause: { status: 500 },
      })
    }

    return createdOrder
  })
}

function updateProductStocksAfterOrder(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
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
