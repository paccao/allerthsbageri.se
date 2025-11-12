import { z } from 'zod'
import { createCustomerBodySchema } from '../customer/customer.schemas.ts'
import { createOrderItemBodySchema } from '../order-item/order-item.schemas.ts'

export const getOrderSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  customerId: z.int().min(1),
  pickupOccasionId: z.int().min(1),
  statusId: z.int().min(1),
})
export type Order = z.infer<typeof getOrderSchema>
export const listOrdersSchema = z.array(getOrderSchema)

export const orderSchema = getOrderSchema.omit({
  id: true,
  createdAt: true,
})
export type OrderBody = z.infer<typeof orderSchema>

export const createOrderBodySchema = z.object({
  customer: createCustomerBodySchema,
  pickupOccasionId: z.int().min(1),
  statusId: z.int().min(1).optional(),
  // TODO: Add test to verify that at least one orderItem is provided
  orderItems: z
    .array(createOrderItemBodySchema)
    .min(1, 'Must contain at least one order item'),
})
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>
