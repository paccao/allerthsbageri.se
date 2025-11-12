import { z } from 'zod'

export const createOrderItemBodySchema = z.object({
  /** The max value should be validated in the handler */
  count: z.int().min(0),
  productId: z.int().min(1),
})
export type CreateOrderItemSchema = z.infer<typeof createOrderItemBodySchema>
