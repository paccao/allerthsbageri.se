import { orderStatusTable } from '#db/schema.ts'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const orderStatusSchema = z.object({
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
export type OrderStatusSchema = z.infer<typeof orderStatusSchema>
