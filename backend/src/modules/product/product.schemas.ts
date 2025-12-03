import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod'
import { z } from 'zod'

import { productTable } from '#db/schema.ts'

export const getProductSchema = createSelectSchema(productTable)
export const listProductsSchema = z.array(getProductSchema)
export type Product = z.infer<typeof getProductSchema>

export const createProductBodySchema = createInsertSchema(productTable)
  .extend({
    stock: z.int().min(0),
    price: z.int().min(0),
    maxPerCustomer: z.int().min(1).optional().nullable(),
    pickupOccasionId: z.int().min(1),
    productDetailsId: z.int().min(1),
  })
  .omit({ id: true })
export type CreateProductBody = z.infer<typeof createProductBodySchema>

export const updateProductBodySchema = createUpdateSchema(
  productTable,
).superRefine(
  (
    { stock, price, maxPerCustomer, pickupOccasionId, productDetailsId },
    ctx,
  ) => {
    if (
      !stock &&
      !price &&
      !maxPerCustomer &&
      !pickupOccasionId &&
      !productDetailsId
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          'At least 1 of the parameters must be provided in order to update a product',
      })
    }
  },
)
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>
