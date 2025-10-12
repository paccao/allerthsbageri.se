import { db } from '#db/index.ts'
import { pickupOccasionTable } from '#db/schema.ts'
import { eq } from 'drizzle-orm'

export async function listPickups() {
  return db.select().from(pickupOccasionTable)
}

export async function createPickup({
  bookingStart,
  bookingEnd,
  pickupStart,
  pickupEnd,
  ...data
}: Pick<typeof pickupOccasionTable.$inferInsert, 'name' | 'location'> & {
  bookingStart: Date
  bookingEnd: Date
  pickupStart: Date
  pickupEnd: Date
}) {
  const results = await db
    .insert(pickupOccasionTable)
    .values({
      ...data,
      bookingStart: bookingStart.toISOString(),
      bookingEnd: bookingEnd.toISOString(),
      pickupStart: pickupStart.toISOString(),
      pickupEnd: pickupEnd.toISOString(),
    })
    .returning()

  return results[0]!
}

export async function updatePickup(
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

export async function deletePickup(id: number) {
  // TODO: Implement cascading delete since ProductTable is dependent on pickup occasions
  await db.delete(pickupOccasionTable).where(eq(pickupOccasionTable.id, id))
}
