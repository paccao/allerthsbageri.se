import { pickupOccasionTable } from '#db/schema.ts'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const getPickupOccasionSchema = createSelectSchema(pickupOccasionTable)
export const listPickupOccasionsSchema = z.array(getPickupOccasionSchema)
export type GetPickupOccasion = z.infer<typeof getPickupOccasionSchema>

export const updatePickupOccasionBodySchema = z
  .object({
    name: z.string().max(200).optional(),
    location: z.string().max(150).optional(),
    orderStart: z.coerce.date().optional(),
    orderEnd: z.coerce.date().optional(),
    pickupStart: z.coerce.date().optional(),
    pickupEnd: z.coerce.date().optional(),
  })
  .superRefine(({ orderStart, orderEnd, pickupStart, pickupEnd }, ctx) => {
    if ((orderStart || orderEnd) && !(orderStart && orderEnd)) {
      ctx.addIssue({
        code: 'custom',
        message: 'both orderStart and orderEnd must be provided together',
      })
    }

    if ((pickupStart || pickupEnd) && !(pickupStart && pickupEnd)) {
      ctx.addIssue({
        code: 'custom',
        message: 'both pickupStart and pickupEnd must be provided together',
      })
    }

    if (orderStart && orderEnd) {
      if (orderStart.getTime() >= orderEnd.getTime()) {
        ctx.addIssue({
          code: 'custom',
          message: 'orderStart must be before orderEnd',
        })
      }
    }

    if (pickupStart && pickupEnd) {
      if (pickupStart.getTime() >= pickupEnd.getTime()) {
        ctx.addIssue({
          code: 'custom',
          message: 'pickupStart must be before pickupEnd',
        })
      }
    }
  })

export type UpdatePickupOccasionBody = z.infer<
  typeof updatePickupOccasionBodySchema
>

export const createPickupOccasionBodySchema = z
  .object({
    name: z.string().max(200),
    location: z.string().max(150),
    orderStart: z.coerce.date(),
    orderEnd: z.coerce.date(),
    pickupStart: z.coerce.date(),
    pickupEnd: z.coerce.date(),
  })
  .superRefine(({ orderStart, orderEnd, pickupStart, pickupEnd }, ctx) => {
    if (orderStart.getTime() >= orderEnd.getTime()) {
      ctx.addIssue({
        code: 'custom',
        message: 'orderStart must be before orderEnd',
      })
    }

    if (pickupStart.getTime() >= pickupEnd.getTime()) {
      ctx.addIssue({
        code: 'custom',
        message: 'pickupStart must be before pickupEnd',
      })
    }
  })

export type CreatePickupOccasionBody = z.infer<
  typeof createPickupOccasionBodySchema
>
