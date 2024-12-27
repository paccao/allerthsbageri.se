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

  const role = await createPickup({
    name,
    description,
    bookingOpens,
    bookingCloses,
    pickupOpens,
    pickupCloses,
  })

  return role
}
