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
  getCustomerSchema,
  type UpdateCustomerBody,
  updateCustomerBodySchema,
} from './customer.schemas.ts'
import { getTags } from '#utils/openAPI.ts'
import {
  emptyBodySchema,
  getErrorResponseSchemas,
  idParamsSchema,
  type IdParams,
} from '#utils/common.schemas.ts'

const tags = getTags('customers')

export async function customerRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateCustomerBody }>(
    '/',
    {
      schema: {
        body: createCustomerBodySchema,
        response: {
          201: getCustomerSchema,
          ...getErrorResponseSchemas(401, 500),
        },
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
        response: {
          200: getCustomerSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
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
        response: {
          200: getCustomerSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
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
        response: {
          204: emptyBodySchema,
          ...getErrorResponseSchemas(401, 500),
        },
        tags,
      },
    },
    deleteCustomerHandler,
  )
}
