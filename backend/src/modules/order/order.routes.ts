import type { FastifyInstance } from 'fastify'
import { createOrderHandler } from './order.controller.ts'
import { type CreateOrderBody, createOrderBodySchema } from './order.schemas.ts'
import { getTags } from '#utils/openAPI.ts'

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
}
