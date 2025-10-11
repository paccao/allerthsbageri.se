import { db } from '#db/index.ts'
import { productDetailsTable } from '#db/schema.ts'

export async function listProductDetails() {
  return db.select().from(productDetailsTable)
}
