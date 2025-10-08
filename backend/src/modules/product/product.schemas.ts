import { z } from 'zod'

export const getProductAvailabilityByIdSchema = z.object({
  amount: z.number().int(),
})
