import type { FastifyInstance } from 'fastify'
import { createOrderHandler, getProductsAvailabilityByIdHandler } from './order.controller.ts'
import { type CreateOrderBody, createOrderBodySchema, getProductAvailabilityByIdSchema } from './order.schemas.ts'
import { getTags } from '#config/openapi.ts'
import { getErrorResponseSchemas, idParamsSchema, type IdParams } from '#utils/common.schemas.ts'

const tags = getTags('orders')

export async function orderRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateOrderBody }>(
    '/',
    {
      schema: {
        body: createOrderBodySchema,
        tags,
      },
    },
    createOrderHandler,
  )

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
