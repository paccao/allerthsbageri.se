import { z } from 'zod'

import { zPhone } from '@/utils/zod.ts'

export const createCustomerBodySchema = z.object({
  name: z.string().max(200),
  phone: zPhone,
})

export type CreateCustomerBody = z.infer<typeof createCustomerBodySchema>
