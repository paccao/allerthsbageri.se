import type { FastifyInstance } from 'fastify'

import { upsertCustomerHandler } from './customer.controller.ts'
import {
  type CreateCustomerBody,
  createCustomerBodySchema,
} from './customer.schemas.ts'
import { getTags } from '#utils/openAPI.ts'

const tags = getTags('customers')

export async function customerRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateCustomerBody }>(
    '/',
    {
      schema: {
        body: createCustomerBodySchema,
        tags,
      },
    },
    upsertCustomerHandler,
  )
}
