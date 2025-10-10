import { pickupOccasionTable } from '#db/schema.ts'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const getPickupSchema = createSelectSchema(pickupOccasionTable)
export const listPickupSchema = z.array(getPickupSchema)
export type GetPickup = z.infer<typeof getPickupSchema>

export const updatePickupBodySchema = z
  .object({
    name: z.string().max(200).optional(),
    location: z.string().max(150).optional(),
    bookingStart: z.coerce.date().optional(),
    bookingEnd: z.coerce.date().optional(),
    pickupStart: z.coerce.date().optional(),
    pickupEnd: z.coerce.date().optional(),
  })
  .superRefine(({ bookingStart, bookingEnd, pickupStart, pickupEnd }, ctx) => {
    if ((bookingStart || bookingEnd) && !(bookingStart && bookingEnd)) {
      ctx.addIssue({
        code: 'custom',
        message: 'both bookingStart and bookingEnd must be provided together',
      })
    }

    if ((pickupStart || pickupEnd) && !(pickupStart && pickupEnd)) {
      ctx.addIssue({
        code: 'custom',
        message: 'both pickupStart and pickupEnd must be provided together',
      })
    }

    if (bookingStart && bookingEnd) {
      if (bookingStart.getTime() < bookingEnd.getTime()) {
        ctx.addIssue({
          code: 'custom',
          message: 'bookingStart must be before bookingEnd',
        })
      }
    }

    if (pickupStart && pickupEnd) {
      if (pickupStart.getTime() < pickupEnd.getTime()) {
        ctx.addIssue({
          code: 'custom',
          message: 'pickupStart must be before pickupEnd',
        })
      }
    }
  })

export type UpdatePickupBody = z.infer<typeof updatePickupBodySchema>

export const createPickupBodySchema = z
  .object({
    name: z.string().max(200),
    location: z.string().max(150),
    bookingStart: z.coerce.date(),
    bookingEnd: z.coerce.date(),
    pickupStart: z.coerce.date(),
    pickupEnd: z.coerce.date(),
  })
  .superRefine(({ bookingStart, bookingEnd, pickupStart, pickupEnd }, ctx) => {
    if (bookingStart.getTime() < bookingEnd.getTime()) {
      ctx.addIssue({
        code: 'custom',
        message: 'bookingStart must be before bookingEnd',
      })
    }

    if (pickupStart.getTime() < pickupEnd.getTime()) {
      ctx.addIssue({
        code: 'custom',
        message: 'pickupStart must be before pickupEnd',
      })
    }
  })

export type CreatePickupBody = z.infer<typeof createPickupBodySchema>
