import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreatePickupBody } from './pickup.schemas.ts'
import { listPickups, createPickup } from './pickup.service.ts'

export async function listPickupsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const pickups = await listPickups()

    return pickups
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to list pickups' })
  }
}

export async function createPickupHandler(
  request: FastifyRequest<{ Body: CreatePickupBody }>,
  reply: FastifyReply,
) {
  const {
    name,
    description,
    bookingStart,
    bookingEnd,
    pickupStart,
    pickupEnd,
  } = request.body

  try {
    const pickup = await createPickup({
      name,
      description,
      bookingStart,
      bookingEnd,
      pickupStart,
      pickupEnd,
    })
    return pickup
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create pickup' })
  }
}
