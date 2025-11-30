import { eq } from 'drizzle-orm'

import { db } from '#db/index.ts'
import { productDetailsTable } from '#db/schema.ts'
import type { CreateProductDetailBody } from './product-details.schemas.ts'

export async function getProductDetail(id: number) {
  const results = await db
    .select()
    .from(productDetailsTable)
    .where(eq(productDetailsTable.id, id))

  return results[0]
}

export async function listProductDetails() {
  return db.select().from(productDetailsTable)
}

export async function createProductDetail({
  ...data
}: CreateProductDetailBody) {
  const results = await db
    .insert(productDetailsTable)
    .values({ ...data })
    .returning()

  return results[0]!
}

export async function updateProductDetail(
  id: number,
  data: Partial<typeof productDetailsTable.$inferInsert>,
) {
  const results = await db
    .update(productDetailsTable)
    .set(data)
    .where(eq(productDetailsTable.id, id))
    .returning()

  return results[0]
}
