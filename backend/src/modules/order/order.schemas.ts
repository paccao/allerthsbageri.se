import { z } from 'zod'
import { createSelectSchema } from 'drizzle-zod'

import { createCustomerBodySchema } from '../customer/customer.schemas.ts'
import { createOrderItemBodySchema } from '../order-item/order-item.schemas.ts'
import { orderTable } from '#db/schema.ts'

export const getOrderSchema = createSelectSchema(orderTable)

export type Order = z.infer<typeof getOrderSchema>
export const listOrdersSchema = z.array(getOrderSchema)

export const createOrderBodySchema = z.object({
  customer: createCustomerBodySchema,
  pickupOccasionId: z.int().min(1),
  statusId: z.int().min(1).optional(),
  orderItems: z
    .array(createOrderItemBodySchema)
    .min(1, 'Must contain at least one order item'),
})
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>
