import { customerOrderTable } from '#db/schema.ts'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createCustomerOrderBodySchema =
  createInsertSchema(customerOrderTable)

export type CreateCustomerOrderBody = z.infer<
  typeof createCustomerOrderBodySchema
>
