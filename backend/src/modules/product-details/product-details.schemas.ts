import { productDetailsTable } from '#db/schema.ts'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const getProductDetailsSchema = createSelectSchema(productDetailsTable)
export const listProductDetailsSchema = z.array(getProductDetailsSchema)
export type GetProductDetails = z.infer<typeof getProductDetailsSchema>
