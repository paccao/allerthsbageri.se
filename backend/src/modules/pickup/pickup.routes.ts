import type { FastifyInstance } from 'fastify'
import { listPickupsHandler, createPickupHandler } from './pickup.controller.ts'
import {
  type CreatePickupBody,
  createPickupBodySchema,
  listPickupSchema,
} from './pickup.schemas.ts'
import { getTags } from '#config/openapi.ts'
import { getErrorResponseSchemas } from '#utils/common.schemas.ts'

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
        tags,
      },
    },
    createPickupHandler,
  )
}
