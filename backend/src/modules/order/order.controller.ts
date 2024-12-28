import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateOrderBody } from './order.schemas.ts'
import { createOrder } from './order.service.ts'

export async function createOrderHandler(
  request: FastifyRequest<{ Body: CreateOrderBody }>,
  reply: FastifyReply,
) {
  const { customerId, pickupOccasionId, statusId } = request.body

  try {
    // TODO: Add DB seeding script which adds common order statuses
    const order = await createOrder({
      customerId,
      pickupOccasionId,
      statusId,
    })
    return order
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create order' })
  }
}
