import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod'
import { z } from 'zod'

import { productDetailsTable } from '#db/schema.ts'

export const getProductDetailsSchema = createSelectSchema(productDetailsTable)
export const listProductDetailsSchema = z.array(getProductDetailsSchema)
export type GetProductDetails = z.infer<typeof getProductDetailsSchema>

export const createProductDetailsBodySchema = createInsertSchema(
  productDetailsTable,
)
  .extend({
    // Override with more specific validation
    image: z.string().nullable().default(null),
    vatPercentage: z.int().min(1).max(100),
  })
  .omit({ id: true })
export type CreateProductDetailsBody = z.infer<
  typeof createProductDetailsBodySchema
>

export const updateProductDetailsBodySchema =
  createUpdateSchema(productDetailsTable)
export type UpdateProductDetailsBody = z.infer<
  typeof updateProductDetailsBodySchema
>
