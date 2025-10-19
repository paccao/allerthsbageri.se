import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateCustomerOrderBody } from './customer-order.schemas.ts'
import { createCustomerOrder } from './customer-order.service.ts'

export async function createCustomerOrderHandler(
  request: FastifyRequest<{ Body: CreateCustomerOrderBody }>,
  reply: FastifyReply,
) {
  const { customerId, pickupOccasionId, statusId } = request.body

  try {
    const customerOrder = await createCustomerOrder({
      customerId,
      pickupOccasionId,
      statusId,
    })
    return customerOrder
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create order' })
  }
}
