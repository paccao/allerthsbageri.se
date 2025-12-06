import { eq, TransactionRollbackError } from 'drizzle-orm'

import {
  pickupOccasionTable,
  productDetailsTable,
  productTable,
} from '#db/schema.ts'
import { type CreateProductBody } from './product.schemas.ts'
import type { DependencyContainer } from '#src/di-container.ts'

export class ProductService {
  #db: DependencyContainer['db']
  log: DependencyContainer['log']

  constructor(db: DependencyContainer['db'], log: DependencyContainer['log']) {
    this.#db = db
    this.log = log
  }

  async getProductById(id: number) {
    const results = await this.#db
      .select()
      .from(productTable)
      .where(eq(productTable.id, id))

    return results[0]
  }

  async listProducts() {
    return await this.#db.select().from(productTable)
  }

  createProduct(data: CreateProductBody) {
    return this.#db.transaction((tx) => {
      try {
        const [productDetails] = tx
          .select()
          .from(productDetailsTable)
          .where(eq(productDetailsTable.id, data.productDetailsId))
          .all()

        if (!productDetails?.id) {
          tx.rollback()
        }

        const [pickupOccasion] = tx
          .select()
          .from(pickupOccasionTable)
          .where(eq(pickupOccasionTable.id, data.pickupOccasionId))
          .all()

        if (!pickupOccasion?.id) {
          tx.rollback()
        }

        const results = tx.insert(productTable).values(data).returning().all()

        return results[0]!
      } catch (error) {
        if (error instanceof TransactionRollbackError) {
          return null
        } else {
          this.log.error(error)
          throw new Error('Unexpected error')
        }
      }
    })
  }

  updateProduct(id: number, data: Partial<typeof productTable.$inferInsert>) {
    return this.#db.transaction((tx) => {
      try {
        if (data.productDetailsId) {
          const [productDetails] = tx
            .select()
            .from(productDetailsTable)
            .where(eq(productDetailsTable.id, data.productDetailsId))
            .all()

          if (!productDetails?.id) {
            tx.rollback()
          }
        }

        if (data.pickupOccasionId) {
          const [pickupOccasion] = tx
            .select()
            .from(pickupOccasionTable)
            .where(eq(pickupOccasionTable.id, data.pickupOccasionId))
            .all()

          if (!pickupOccasion?.id) {
            tx.rollback()
          }
        }

        const results = tx
          .update(productTable)
          .set(data)
          .where(eq(productTable.id, id))
          .returning()
          .all()

        return results[0]!
      } catch (error) {
        if (error instanceof TransactionRollbackError) {
          return null
        } else {
          throw new Error('Unexpected error')
        }
      }
    })
  }
}
