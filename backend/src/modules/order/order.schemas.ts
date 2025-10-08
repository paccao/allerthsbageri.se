import { z } from 'zod'

export const createOrderBodySchema = z.object({
  customerId: z.number().int(),
  pickupOccasionId: z.number().int(),
  statusId: z.number().int(),
})

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>
