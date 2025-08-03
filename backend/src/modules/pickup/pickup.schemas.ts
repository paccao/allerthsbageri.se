import { z } from 'zod'

export const createPickupBodySchema = z
  .object({
    name: z.string().max(200),
    description: z.string().max(1000),
    bookingStart: z.date(),
    bookingEnd: z.date(),
    pickupStart: z.date(),
    pickupEnd: z.date(),
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
