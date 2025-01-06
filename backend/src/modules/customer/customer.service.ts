import { db } from '#db/index.ts'
import { customerTable } from '#db/schema.ts'
import { eq } from 'drizzle-orm'

export async function upsertCustomer(data: typeof customerTable.$inferInsert) {
  const results = await db
    .insert(customerTable)
    .values(data)
    .onConflictDoUpdate({
      target: customerTable.phone,
      targetWhere: eq(customerTable.phone, data.phone),
      set: data,
    })
    .returning()

  return results[0]
}
