import type { FastifyInstance } from 'fastify'
import { getProductStockByIdHandler } from './product.controller.ts'
import { getProductStockByIdSchema } from './product.schemas.ts'
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
          200: getProductStockByIdSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    getProductStockByIdHandler,
  )
}
