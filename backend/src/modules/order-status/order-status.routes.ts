import type { FastifyInstance } from 'fastify'
import { createOrderStatusHandler } from './order-status.controller.ts'
import {
  type CreateOrderStatusBody,
  createOrderStatusBodySchema,
} from './order-status.schemas.ts'
import { getTags } from '#config/openapi.ts'
import { getErrorResponseSchemas } from '#utils/common.schemas.ts'

const tags = getTags('orderStatus')

export async function orderStatusRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateOrderStatusBody }>(
    '/',
    {
      schema: {
        body: createOrderStatusBodySchema,
        response: {
          201: createOrderStatusBodySchema,
          ...getErrorResponseSchemas(400, 401, 500),
        },
        tags,
      },
    },
    createOrderStatusHandler,
  )
}
