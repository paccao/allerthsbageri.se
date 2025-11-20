import { orderItemTable } from '#db/schema.ts'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const getOrderItemSchema = createSelectSchema(orderItemTable)
export type OrderItem = z.infer<typeof getOrderItemSchema>

export const createOrderItemBodySchema = z.object({
  /** The max value should be validated in the handler */
  count: z.int().min(0),
  productId: z.int().min(1),
})
export type CreateOrderItemSchema = z.infer<typeof createOrderItemBodySchema>
