import type { FastifyInstance } from 'fastify'
import {
  createOrderStatusHandler,
  getOrderStatusByIdHandler,
  listOrderStatusesHandler,
} from './order-status.controller.ts'
import {
  type CreateOrderStatusBody,
  createOrderStatusBodySchema,
  getOrderStatusSchema,
  listOrderStatusesSchema,
} from './order-status.schemas.ts'
import { getTags } from '#config/openapi.ts'
import {
  getErrorResponseSchemas,
  idParamsSchema,
  type IdParams,
} from '#utils/common.schemas.ts'

const tags = getTags('orderStatus')

export async function orderStatusRoutes(app: FastifyInstance) {
  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        response: {
          200: getOrderStatusSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    getOrderStatusByIdHandler,
  )

  app.get(
    '/',
    {
      schema: {
        response: {
          200: listOrderStatusesSchema,
          ...getErrorResponseSchemas(401, 500),
        },
        tags,
      },
    },
    listOrderStatusesHandler,
  )

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
