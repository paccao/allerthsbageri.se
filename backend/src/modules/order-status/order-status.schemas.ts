import { orderStatusTable } from '#db/schema.ts'
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod'
import { z } from 'zod'

export const getOrderStatusSchema = createSelectSchema(orderStatusTable)
export const listOrderStatusesSchema = z.array(getOrderStatusSchema)
export type OrderStatus = z.infer<typeof getOrderStatusSchema>

export const createOrderStatusBodySchema = createInsertSchema(
  orderStatusTable,
).extend({
  status: z.union(
    [
      z.literal('Bokad'),
      z.literal('Bekräftad'),
      z.literal('Upphämtad'),
      z.literal('Avbokad'),
    ],
    {
      error:
        'The property status must be capitalized and one of the literals: Bokad, Bekräftad, Upphämtad, Avbokad',
    },
  ),
  isDefault: z.boolean().default(false).nonoptional(),
  color: z.string().max(50).optional().nullable(),
})
export type CreateOrderStatusBody = z.infer<typeof createOrderStatusBodySchema>

export const updateOrderStatusBodySchema = createUpdateSchema(orderStatusTable)
  .extend({
    status: z
      .union(
        [
          z.literal('Bokad'),
          z.literal('Bekräftad'),
          z.literal('Upphämtad'),
          z.literal('Avbokad'),
        ],
        {
          error:
            'The property status must be capitalized and one of the literals: Bokad, Bekräftad, Upphämtad, Avbokad',
        },
      )
      .optional(),
    isDefault: z.boolean().default(false).optional(),
    color: z.string().max(50).optional().nullable(),
  })
  .superRefine(({ status, isDefault, color }, ctx) => {
    if (Object.keys({ status, isDefault, color }).some((entry) => !entry)) {
      ctx.addIssue({
        code: 'custom',
        message:
          'At least 1 of the parameters must be provided in order to update an order status',
      })
    }
  })
export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusBodySchema>
