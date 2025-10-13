import { db } from '#db/index.ts'
import { productDetailsTable, productTable } from '#db/schema.ts'
import { eq } from 'drizzle-orm'
import type { CreateProductBody } from './product.schemas.ts'

export async function getProductStockById(id: number) {
  const results = await db
    .select({ stock: productTable.stock })
    .from(productTable)
    .where(eq(productTable.id, id))

  return results[0]
}

export async function createProduct({ ...data }: CreateProductBody) {
  let results

  await db.transaction(async (tx) => {
    await tx
      .select()
      .from(productDetailsTable)
      .where(eq(productDetailsTable.id, data.productDetailsId))

    // todo: get pickup by ID

    results = await tx
      .insert(productTable)
      .values({ ...data })
      .returning()
  })

  return results[0]!
}
