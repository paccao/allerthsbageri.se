import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod'
import { z } from 'zod'

import { productDetailsTable } from '#db/schema.ts'

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

export const updateProductDetailBodySchema =
  createUpdateSchema(productDetailsTable)
export type UpdateProductDetailBody = z.infer<
  typeof updateProductDetailBodySchema
>
