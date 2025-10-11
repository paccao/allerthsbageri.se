import { db } from '#db/index.ts'
import { productDetailsTable } from '#db/schema.ts'
import { eq } from 'drizzle-orm'

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
