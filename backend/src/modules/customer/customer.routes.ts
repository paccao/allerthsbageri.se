import type { FastifyInstance } from 'fastify'

import {
  createCustomerHandler,
  deleteCustomerHandler,
  getCustomerHandler,
  updateCustomerHandler,
} from './customer.controller.ts'
import {
  type CreateCustomerBody,
  createCustomerBodySchema,
  type UpdateCustomerBody,
  updateCustomerBodySchema,
} from './customer.schemas.ts'
import { getTags } from '#utils/openAPI.ts'
import { idParamsSchema, type IdParams } from '#utils/common.schemas.ts'

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

  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        tags,
      },
    },
    getCustomerHandler,
  )

  app.patch<{ Body: UpdateCustomerBody; Params: IdParams }>(
    '/:id',
    {
      schema: {
        body: updateCustomerBodySchema,
        params: idParamsSchema,
        tags,
      },
    },
    updateCustomerHandler,
  )

  app.delete<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        tags,
      },
    },
    deleteCustomerHandler,
  )
}
