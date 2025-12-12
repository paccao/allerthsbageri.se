import type { FastifyReply, FastifyRequest } from 'fastify'

import type { CreatePickupOccasionBody } from './pickup-occasion.schemas.ts'
import type { IdParams } from '#utils/common.schemas.ts'
import type { UpdatePickupOccasionBody } from './pickup-occasion.schemas.ts'
import type { DependencyContainer } from '#src/di-container.ts'

export function createPickupOccasionController(
  pickupOccasionService: DependencyContainer['pickupOccasionService'],
) {
  async function listPickupOccasionsHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      const pickups = await pickupOccasionService.listPickupOccasions()

      return pickups
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply
        .code(500)
        .send({ message: 'Failed to list pickup occasions' })
    }
  }

  async function createPickupOccasionHandler(
    request: FastifyRequest<{ Body: CreatePickupOccasionBody }>,
    reply: FastifyReply,
  ) {
    const { name, location, orderStart, orderEnd, pickupStart, pickupEnd } =
      request.body

    try {
      const pickup = await pickupOccasionService.createPickupOccasion({
        name,
        location,
        orderStart,
        orderEnd,
        pickupStart,
        pickupEnd,
      })
      return reply.code(201).send(pickup)
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply
        .code(500)
        .send({ message: 'Failed to create pickup occasion' })
    }
  }

  async function updatePickupHandler(
    request: FastifyRequest<{
      Params: IdParams
      Body: UpdatePickupOccasionBody
    }>,
    reply: FastifyReply,
  ) {
    const { name, location, orderStart, orderEnd, pickupStart, pickupEnd } =
      request.body

    try {
      const pickup = await pickupOccasionService.updatePickupOccasion(
        request.params.id,
        {
          name,
          location,
          orderStart: orderStart?.toISOString(),
          orderEnd: orderEnd?.toISOString(),
          pickupStart: pickupStart?.toISOString(),
          pickupEnd: pickupEnd?.toISOString(),
        },
      )

      if (!pickup) {
        return reply
          .code(404)
          .send({ message: 'Pickup occasion does not exist' })
      }

      return pickup
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply
        .code(500)
        .send({ message: 'Failed to update pickup occasion' })
    }
  }

  return {
    listPickupOccasionsHandler,
    createPickupOccasionHandler,
    updatePickupHandler,
  }
}
