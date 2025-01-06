import { z } from 'zod'

export const idParamsSchema = z.object({
  id: z.coerce.number().int().min(1),
})

export type IdParams = z.infer<typeof idParamsSchema>
