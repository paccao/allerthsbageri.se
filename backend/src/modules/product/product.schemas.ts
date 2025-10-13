import { productTable } from '#db/schema.ts'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const getProductStockByIdSchema = z.object({
  amount: z.number().int(),
})

export const createProductBodySchema = createInsertSchema(productTable).extend({
  stock: z.int().min(0),
  price: z.bigint().min(0n),
  maxPerCustomer: z.int().min(1).optional(),
})
export type CreateProductBody = z.infer<typeof createProductBodySchema>
