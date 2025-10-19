import { orderStatusTable } from '#db/schema.ts'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const getOrderStatusSchema = createSelectSchema(orderStatusTable)
export const listOrderStatusesSchema = z.array(getOrderStatusSchema)
export type OrderStatus = z.infer<typeof getOrderStatusSchema>

export const createOrderStatusBodySchema = createInsertSchema(
  orderStatusTable,
).extend({
  status: z.union([
    z.literal('IN_PROGRESS'),
    z.literal('COMPLETED'),
    z.literal('CANCELLED'),
  ]),
  color: z.string().max(50).optional().nullable(),
})

export type CreateOrderStatusBody = z.infer<typeof createOrderStatusBodySchema>
