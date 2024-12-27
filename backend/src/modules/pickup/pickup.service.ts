import { db } from '@/db/index.ts'
import { pickupOccasionTable } from '@/db/schema.ts'

export async function createPickup({
  bookingOpens,
  bookingCloses,
  pickupOpens,
  pickupCloses,
  ...data
}: Pick<typeof pickupOccasionTable.$inferInsert, 'name' | 'description'> & {
  bookingOpens: Date
  bookingCloses: Date
  pickupOpens: Date
  pickupCloses: Date
}) {
  const results = await db
    .insert(pickupOccasionTable)
    .values({
      ...data,
      bookingOpens: bookingOpens.toISOString(),
      bookingCloses: bookingCloses.toISOString(),
      pickupOpens: pickupOpens.toISOString(),
      pickupCloses: pickupCloses.toISOString(),
    })
    .returning()

  return results[0]
}
