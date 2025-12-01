import type { FastifyInstance } from 'fastify'

import {
  type CreatePickupOccasionBody,
  createPickupOccasionBodySchema,
  getPickupOccasionSchema,
  listPickupOccasionsSchema,
  type UpdatePickupOccasionBody,
  updatePickupOccasionBodySchema,
} from './pickup-occasion.schemas.ts'
import { getTags } from '#config/openapi.ts'
import {
  getErrorResponseSchemas,
  idParamsSchema,
  type IdParams,
} from '#utils/common.schemas.ts'

const tags = getTags('pickups')

export async function pickupOccasionRoutes(app: FastifyInstance) {
  const { pickupOccasionController } = app.diContainer
  app.get(
    '/',
    {
      schema: {
        response: {
          200: listPickupOccasionsSchema,
          ...getErrorResponseSchemas(401, 500),
        },
        tags,
      },
    },
    pickupOccasionController.listPickupOccasionsHandler,
  )

  app.post<{ Body: CreatePickupOccasionBody }>(
    '/',
    {
      schema: {
        body: createPickupOccasionBodySchema,
        response: {
          201: getPickupOccasionSchema,
          ...getErrorResponseSchemas(401, 500),
        },
        tags,
      },
    },
    pickupOccasionController.createPickupOccasionHandler,
  )

  app.patch<{ Body: UpdatePickupOccasionBody; Params: IdParams }>(
    '/:id',
    {
      schema: {
        body: updatePickupOccasionBodySchema,
        params: idParamsSchema,
        response: {
          200: getPickupOccasionSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    pickupOccasionController.updatePickupHandler,
  )
}
