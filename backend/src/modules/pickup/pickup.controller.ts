import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreatePickupBody } from './pickup.schemas.ts'
import {
  listPickups,
  createPickup,
  updatePickup,
  deletePickup,
} from './pickup.service.ts'
import type { IdParams } from '#utils/common.schemas.ts'
import type { UpdatePickupBody } from './pickup.schemas.ts'

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
  const { name, location, bookingStart, bookingEnd, pickupStart, pickupEnd } =
    request.body

  try {
    const pickup = await createPickup({
      name,
      location,
      bookingStart,
      bookingEnd,
      pickupStart,
      pickupEnd,
    })
    return reply.code(201).send(pickup)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create pickup' })
  }
}

export async function updatePickupHandler(
  request: FastifyRequest<{
    Params: IdParams
    Body: UpdatePickupBody
  }>,
  reply: FastifyReply,
) {
  const { name, location, bookingStart, bookingEnd, pickupStart, pickupEnd } =
    request.body

  try {
    const pickup = await updatePickup(request.params.id, {
      name,
      location,
      bookingStart: bookingStart?.toISOString(),
      bookingEnd: bookingEnd?.toISOString(),
      pickupStart: pickupStart?.toISOString(),
      pickupEnd: pickupEnd?.toISOString(),
    })

    if (!pickup) {
      return reply.code(404).send({ message: 'Pickup does not exist' })
    }

    return pickup
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to update pickup occasion' })
  }
}

export async function deletePickupHandler(
  request: FastifyRequest<{
    Params: IdParams
  }>,
  reply: FastifyReply,
) {
  try {
    await deletePickup(request.params.id)
    return reply.code(204).send()
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to delete pickup' })
  }
}
