import { z } from 'zod'

export const idParamsSchema = z.object({
  id: z.coerce.number().int().min(1),
})

export type IdParams = z.infer<typeof idParamsSchema>

export const errorMessageSchema = z.object({ message: z.string() })
export const emptyBodySchema = z.undefined()

/**
 * Get common error responses for a list of HTTP status codes.
 */
export function getErrorResponseSchemas(...statusCodes: number[]) {
  return statusCodes.reduce(
    (acc, status) => {
      acc[status] = errorMessageSchema
      return acc
    },
    {} as Record<number, z.ZodType>,
  )
}
