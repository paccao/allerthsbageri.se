import type { FastifyInstance } from 'fastify'
import { createPickupHandler } from './pickup.controller.ts'
import {
  type CreatePickupBody,
  createPickupBodySchema,
} from './pickup.schemas.ts'
import { getTags } from '#config/openapi.ts'

const tags = getTags('pickups')

export async function pickupRoutes(app: FastifyInstance) {
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
