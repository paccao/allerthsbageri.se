import { productDetailsTable } from '#db/schema.ts'
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const getProductDetailSchema = createSelectSchema(productDetailsTable)
export const listProductDetailsSchema = z.array(getProductDetailSchema)
export type GetProductDetail = z.infer<typeof getProductDetailSchema>

export const createProductDetailBodySchema = createInsertSchema(
  productDetailsTable,
).extend({
  image: z.string().nullable().default(null),
  vatPercentage: z.int().min(1).max(100),
})
export type CreateProductDetailBody = z.infer<
  typeof createProductDetailBodySchema
>
