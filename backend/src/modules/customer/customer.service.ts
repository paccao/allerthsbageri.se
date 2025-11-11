import { eq } from 'drizzle-orm'

import { db } from '#db/index.ts'
import { customerTable } from '#db/schema.ts'

export async function createCustomer(data: typeof customerTable.$inferInsert) {
  const [customer] = await db.insert(customerTable).values(data).returning()

  return customer!
}

export async function listCustomers() {
  return db.select().from(customerTable)
}

export async function getCustomer(id: number) {
  const results = await db
    .select()
    .from(customerTable)
    .where(eq(customerTable.id, id))

  return results[0]
}

export async function updateCustomer(
  id: number,
  data: Partial<typeof customerTable.$inferInsert>,
) {
  const results = await db
    .update(customerTable)
    .set(data)
    .where(eq(customerTable.id, id))
    .returning()

  return results[0]
}

export async function deleteCustomer(id: number) {
  await db.delete(customerTable).where(eq(customerTable.id, id))
}

export async function getOrCreateCustomer(
  data: Omit<typeof customerTable.$inferInsert, 'id'>,
) {
  let [customer] = await db
    .select()
    .from(customerTable)
    .where(eq(customerTable.phone, data.phone))

  if (customer) {
    return customer
  }

  return createCustomer(data)
}
