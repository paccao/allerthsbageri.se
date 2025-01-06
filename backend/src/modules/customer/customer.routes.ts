import type { FastifyInstance } from 'fastify'

import {
  createCustomerHandler,
  updateCustomerHandler,
} from './customer.controller.ts'
import {
  type CreateCustomerBody,
  createCustomerBodySchema,
  type UpdateCustomerBody,
  updateCustomerBodySchema,
  type UpdateCustomerParams,
  updateCustomerParamsSchema,
} from './customer.schemas.ts'
import { getTags } from '#utils/openAPI.ts'

const tags = getTags('customers')

export async function customerRoutes(app: FastifyInstance) {
  // TODO: Define valid responses for the OpenAPI docs
  // IDEA: Use common responses for errors that can be reused across multiple endpoints. Perhaps as a shared schema
  app.post<{ Body: CreateCustomerBody }>(
    '/',
    {
      schema: {
        body: createCustomerBodySchema,
        tags,
      },
    },
    createCustomerHandler,
  )

  app.post<{ Body: UpdateCustomerBody; Params: UpdateCustomerParams }>(
    '/:id',
    {
      schema: {
        body: updateCustomerBodySchema,
        params: updateCustomerParamsSchema,
        tags,
      },
    },
    updateCustomerHandler,
  )
}
