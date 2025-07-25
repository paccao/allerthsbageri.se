import { z } from 'zod'

export const createPickupBodySchema = z
  .object({
    name: z.string().max(200),
    description: z.string().max(1000),
    bookingOpens: z.date(),
    bookingCloses: z.date(),
    pickupOpens: z.date(),
    pickupCloses: z.date(),
  })
  .superRefine(
    ({ bookingOpens, bookingCloses, pickupOpens, pickupCloses }, ctx) => {
      if (bookingOpens.getTime() > bookingCloses.getTime()) {
        ctx.addIssue({
          code: 'custom',
          message: 'bookingCloses must be after bookingOpens',
        })
      }

      if (pickupOpens.getTime() > pickupCloses.getTime()) {
        ctx.addIssue({
          code: 'custom',
          message: 'pickupCloses must be after pickupOpens',
        })
      }
    },
  )

export type CreatePickupBody = z.infer<typeof createPickupBodySchema>
