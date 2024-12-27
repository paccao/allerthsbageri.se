import { z } from 'zod'

export const createCustomerBodySchema = z.object({
  name: z.string().max(200),
  // TODO: Enforce stricter phone number validation
  // by using libphonenumber-js
  phone: z.string().max(50),
})

export type CreateCustomerBody = z.infer<typeof createCustomerBodySchema>
