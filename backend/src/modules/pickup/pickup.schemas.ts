import { pickupOccasionTable } from '#db/schema.ts'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const getPickupSchema = createSelectSchema(pickupOccasionTable)
export const listPickupSchema = z.array(getPickupSchema)
export type ListPickup = z.infer<typeof listPickupSchema>

export const updatePickupBodySchema = z.object({
  name: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  bookingStart: z.coerce.date().optional(),
  bookingEnd: z.coerce.date().optional(),
  pickupStart: z.coerce.date().optional(),
  pickupEnd: z.coerce.date().optional(),
})

export type UpdatePickupBody = z.infer<typeof updatePickupBodySchema>

export const createPickupBodySchema = z
  .object({
    name: z.string().max(200),
    description: z.string().max(1000),
    bookingStart: z.coerce.date(),
    bookingEnd: z.coerce.date(),
    pickupStart: z.coerce.date(),
    pickupEnd: z.coerce.date(),
  })
  .superRefine(({ bookingStart, bookingEnd, pickupStart, pickupEnd }, ctx) => {
    if (bookingStart.getTime() > bookingEnd.getTime()) {
      ctx.addIssue({
        code: 'custom',
        message: 'bookingEnd must be after bookingStart',
      })
    }

    if (pickupStart.getTime() > pickupEnd.getTime()) {
      ctx.addIssue({
        code: 'custom',
        message: 'pickupEnd must be after pickupStart',
      })
    }
  })

export type CreatePickupBody = z.infer<typeof createPickupBodySchema>
