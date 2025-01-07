import { z } from 'zod'
import { createSelectSchema } from 'drizzle-zod'

import { zPhone } from '#utils/zod.ts'
import { customerTable } from '#db/schema.ts'

export const createCustomerBodySchema = z.object({
  name: z.string().max(200),
  phone: zPhone,
})

export const getCustomerSchema = createSelectSchema(customerTable)

export type CreateCustomerBody = z.infer<typeof createCustomerBodySchema>

export const updateCustomerBodySchema = z
  .object({
    name: z.string().max(200).optional(),
    phone: zPhone.optional(),
  })
  .superRefine(({ name, phone }, ctx) => {
    if (name === undefined && phone === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either name or phone must be provided',
      })
    }
  })

export type UpdateCustomerBody = z.infer<typeof updateCustomerBodySchema>
