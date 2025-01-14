import type { FastifyInstance } from 'fastify'

import {
  createCustomerHandler,
  deleteCustomerHandler,
  getCustomerHandler,
  listCustomersHandler,
  updateCustomerHandler,
} from './customer.controller.ts'
import {
  type CreateCustomerBody,
  createCustomerBodySchema,
  getCustomerSchema,
  listCustomersSchema,
  type UpdateCustomerBody,
  updateCustomerBodySchema,
} from './customer.schemas.ts'
import { getTags } from '#config/openapi.ts'
import {
  emptyBodySchema,
  getErrorResponseSchemas,
  idParamsSchema,
  type IdParams,
} from '#utils/common.schemas.ts'

const tags = getTags('customers')

// TODO: Define responses for HTTP 400 errors
// There might be a common schema that could be used.
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

  app.get(
    '/',
    {
      schema: {
        response: {
          200: listCustomersSchema,
          ...getErrorResponseSchemas(401, 500),
        },
        tags,
      },
    },
    listCustomersHandler,
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
