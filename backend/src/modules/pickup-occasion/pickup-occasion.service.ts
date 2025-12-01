import { eq } from 'drizzle-orm'

import { db } from '#db/index.ts'
import { pickupOccasionTable } from '#db/schema.ts'

export async function getPickupOccasion(id: number) {
  const results = await db
    .select()
    .from(pickupOccasionTable)
    .where(eq(pickupOccasionTable.id, id))

  return results[0]
}

export async function listPickupOccasions() {
  return db.select().from(pickupOccasionTable)
}

export async function createPickupOccasion({
  orderStart,
  orderEnd,
  pickupStart,
  pickupEnd,
  ...data
}: Pick<typeof pickupOccasionTable.$inferInsert, 'name' | 'location'> & {
  orderStart: Date
  orderEnd: Date
  pickupStart: Date
  pickupEnd: Date
}) {
  const results = await db
    .insert(pickupOccasionTable)
    .values({
      ...data,
      orderStart: orderStart.toISOString(),
      orderEnd: orderEnd.toISOString(),
      pickupStart: pickupStart.toISOString(),
      pickupEnd: pickupEnd.toISOString(),
    })
    .returning()

  return results[0]!
}

export async function updatePickupOccasion(
  id: number,
  data: Partial<typeof pickupOccasionTable.$inferInsert>,
) {
  const results = await db
    .update(pickupOccasionTable)
    .set(data)
    .where(eq(pickupOccasionTable.id, id))
    .returning()

  return results[0]
}
