import { FastifyInstance } from 'fastify'
import { createPickupHandler } from './pickup.controller.ts'
import { CreatePickupBody, createPickupBodySchema } from './pickup.schemas.ts'
import { getTags } from '@/utils/openAPI.ts'

const tags = getTags('pickup')

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
