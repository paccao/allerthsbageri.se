import type { FastifyInstance } from 'fastify'
import {
  listPickupsHandler,
  createPickupHandler,
  updatePickupHandler,
} from './pickup.controller.ts'
import {
  type CreatePickupBody,
  createPickupBodySchema,
  getPickupSchema,
  listPickupSchema,
  type UpdatePickupBody,
  updatePickupBodySchema,
} from './pickup.schemas.ts'
import { getTags } from '#config/openapi.ts'
import {
  getErrorResponseSchemas,
  idParamsSchema,
  type IdParams,
} from '#utils/common.schemas.ts'

const tags = getTags('pickups')

export async function pickupRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      schema: {
        response: {
          200: listPickupSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    listPickupsHandler,
  )

  app.post<{ Body: CreatePickupBody }>(
    '/',
    {
      schema: {
        body: createPickupBodySchema,
        response: {
          201: getPickupSchema,
          ...getErrorResponseSchemas(401, 500),
        },
        tags,
      },
    },
    createPickupHandler,
  )

  app.patch<{ Body: UpdatePickupBody; Params: IdParams }>(
    '/:id',
    {
      schema: {
        body: updatePickupBodySchema,
        params: idParamsSchema,
        response: {
          200: getPickupSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    updatePickupHandler,
  )

  //   app.delete<{ Params: IdParams }>(
  //     '/:id',
  //     {
  //       schema: {
  //         params: idParamsSchema,
  //         response: {
  //           204: emptyBodySchema,
  //           ...getErrorResponseSchemas(401, 500),
  //         },
  //         tags,
  //       },
  //     },
  //     deleteCustomerHandler,
  //   )
}
