import { productDetailsTable } from '#db/schema.ts'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const getProductDetailSchema = createSelectSchema(productDetailsTable)
export const listProductDetailsSchema = z.array(getProductDetailSchema)
export type GetProductDetail = z.infer<typeof getProductDetailSchema>
