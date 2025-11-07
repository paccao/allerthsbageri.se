import { z } from 'zod'

export const orderStatusSchema = z.object({})
export type OrderStatusSchema = z.infer<typeof orderStatusSchema>
