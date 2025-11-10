import type { FastifyInstance } from 'fastify'
import { createOrderHandler } from './order.controller.ts'
import {
  type CreateOrderBody,
  createOrderBodySchema,
  orderSchema,
} from './order.schemas.ts'
import { getTags } from '#config/openapi.ts'
import { getErrorResponseSchemas } from '#utils/common.schemas.ts'

const tags = getTags('orders')

export async function orderRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateOrderBody }>(
    '/',
    {
      schema: {
        body: createOrderBodySchema,
        response: {
          201: orderSchema,
          ...getErrorResponseSchemas(400, 401, 404, 500),
        },
        tags,
      },
    },
    createOrderHandler,
  )
}
