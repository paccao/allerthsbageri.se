import type { FastifyInstance } from 'fastify'
import { getProductsAvailabilityByIdHandler } from './product.controller.ts'
import { getProductAvailabilityByIdSchema } from './product.schemas.ts'
import { getTags } from '#config/openapi.ts'
import {
  getErrorResponseSchemas,
  idParamsSchema,
  type IdParams,
} from '#utils/common.schemas.ts'

const tags = getTags('products')

export async function productRoutes(app: FastifyInstance) {
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        response: {
          200: getProductAvailabilityByIdSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    getProductsAvailabilityByIdHandler,
  )
}
