import type { FastifyInstance } from 'fastify'
import { createCustomerOrderHandler } from './customer-order.controller.ts'
import {
  type CreateCustomerOrderBody,
  createCustomerOrderBodySchema,
} from './customer-order.schemas.ts'
import { getTags } from '#config/openapi.ts'

const tags = getTags('customerOrders')

export async function customerOrderRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateCustomerOrderBody }>(
    '/',
    {
      schema: {
        body: createCustomerOrderBodySchema,
        tags,
      },
    },
    createCustomerOrderHandler,
  )
}
