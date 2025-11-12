import { z } from 'zod'

export const createOrderItemBodySchema = z.object({
  count: z.int().min(0), // todo: max value validated in the handler
  productId: z.int().min(1),
})
export type CreateOrderItemSchema = z.infer<typeof createOrderItemBodySchema>
