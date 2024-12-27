import { db } from '@/db/index.ts'
import { customerTable } from '@/db/schema.ts'

export async function createCustomer(data: typeof customerTable.$inferInsert) {
  const results = await db.insert(customerTable).values(data).returning()

  return results[0]
}
