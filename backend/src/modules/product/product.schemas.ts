import { z } from 'zod'

export const getProductStockByIdSchema = z.object({
  amount: z.number().int(),
})
