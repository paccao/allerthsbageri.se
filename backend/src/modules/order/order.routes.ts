import { FastifyInstance } from 'fastify'
import { createOrderHandler } from './order.controller.ts'
import { CreateOrderBody, createOrderBodySchema } from './order.schemas.ts'
import { getTags } from '@/utils/openAPI.ts'

const tags = getTags('order')

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
