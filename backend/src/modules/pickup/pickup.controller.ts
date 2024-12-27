import { FastifyReply, FastifyRequest } from 'fastify'
import { CreatePickupBody } from './pickup.schemas.ts'
import { createPickup } from './pickup.service.ts'

export async function createPickupHandler(
  request: FastifyRequest<{ Body: CreatePickupBody }>,
  reply: FastifyReply,
) {
  const {
    name,
    description,
    bookingOpens,
    bookingCloses,
    pickupOpens,
    pickupCloses,
  } = request.body

  try {
    const pickup = await createPickup({
      name,
      description,
      bookingOpens,
      bookingCloses,
      pickupOpens,
      pickupCloses,
    })
    return pickup
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create pickup' })
  }
}
