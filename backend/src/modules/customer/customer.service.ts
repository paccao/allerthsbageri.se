import { db } from '#db/index.ts'
import { customerTable } from '#db/schema.ts'
import { eq } from 'drizzle-orm'

export async function upsertCustomer(data: typeof customerTable.$inferInsert) {
  const results = await db
    .insert(customerTable)
    .values(data)
    .onConflictDoUpdate({
      target: customerTable.id,
      set: data,
      where: eq(customerTable.phone, data.phone),
    })
    .returning()

  return results[0]
}
