import { db } from '#db/index.ts'
import {
  pickupOccasionTable,
  productDetailsTable,
  productTable,
} from '#db/schema.ts'
import { eq, TransactionRollbackError } from 'drizzle-orm'
import { type CreateProductBody } from './product.schemas.ts'

export async function getProductStockById(id: number) {
  const results = await db
    .select({ stock: productTable.stock })
    .from(productTable)
    .where(eq(productTable.id, id))

  return results[0]
}

// TODO: TypeError: Transaction function cannot return a promise
export function createProduct({ ...data }: CreateProductBody) {
  return db.transaction((tx) => {
    try {
      const [productDetail] = tx
        .select()
        .from(productDetailsTable)
        .where(eq(productDetailsTable.id, data.productDetailsId))
        .all()

      if (!productDetail?.id) {
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

      const results = tx
        .insert(productTable)
        .values({ ...data })
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
