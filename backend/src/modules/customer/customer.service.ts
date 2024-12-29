import { db } from '@/db/index.ts'
import { customerTable } from '@/db/schema.ts'

export async function upsertCustomer(data: typeof customerTable.$inferInsert) {
  const results = await db
    .insert(customerTable)
    .values(data)
    .onConflictDoUpdate({
      target: customerTable.id,
      set: data,
    })
    .returning()

  return results[0]
}
