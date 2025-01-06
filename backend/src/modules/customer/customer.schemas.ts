import { z } from 'zod'

import { zPhone } from '#utils/zod.ts'

export const createCustomerBodySchema = z.object({
  name: z.string().max(200),
  phone: zPhone,
})

export type CreateCustomerBody = z.infer<typeof createCustomerBodySchema>

export const updateCustomerBodySchema = z.object({
  name: z.string().max(200),
  phone: zPhone,
})

export type UpdateCustomerBody = z.infer<typeof updateCustomerBodySchema>

export const updateCustomerParamsSchema = z.object({
  id: z.coerce.number().int().min(1),
})

export type UpdateCustomerParams = z.infer<typeof updateCustomerParamsSchema>
