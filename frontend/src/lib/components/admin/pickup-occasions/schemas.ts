import { z } from 'zod/v4'

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
})

export type Schema = z.infer<typeof schema>

export const pickupOccasion = z.object({
  id: z.number(),
  name: z.string(),
  location: z.string(),
  orderStart: z.string(),
  orderEnd: z.string(),
  pickupStart: z.string(),
  pickupEnd: z.string(),
})

export type PickupOccasion = z.infer<typeof pickupOccasion>
