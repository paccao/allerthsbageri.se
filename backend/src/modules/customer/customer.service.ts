import { eq } from 'drizzle-orm'

import { db } from '#db/index.ts'
import { customerTable } from '#db/schema.ts'

export async function createCustomer(data: typeof customerTable.$inferInsert) {
  const results = await db.insert(customerTable).values(data).returning()

  return results[0]
}

export async function updateCustomer(
  id: number,
  data: typeof customerTable.$inferInsert,
) {
  const results = await db
    .update(customerTable)
    .set(data)
    .where(eq(customerTable.id, id))
    .returning()

  return results[0]
}
