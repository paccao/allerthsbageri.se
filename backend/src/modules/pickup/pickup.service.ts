import { db } from '#db/index.ts'
import { pickupOccasionTable } from '#db/schema.ts'

export async function createPickup({
  bookingStart,
  bookingEnd,
  pickupStart,
  pickupEnd,
  ...data
}: Pick<typeof pickupOccasionTable.$inferInsert, 'name' | 'description'> & {
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

  return results[0]
}
