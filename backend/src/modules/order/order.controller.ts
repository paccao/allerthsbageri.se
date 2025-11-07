import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateOrderBody } from './order.schemas.ts'
import { createOrder } from './order.service.ts'

export async function createOrderHandler(
  request: FastifyRequest<{ Body: CreateOrderBody }>,
  reply: FastifyReply,
) {
  const { customer } = request.body

  try {
    // const order = await createOrder({
    //   customerId,
    //   pickupOccasionId,
    //   statusId,
    // })

    // todo: handle if any of the passed IDs are not found
    // return 404

    return
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create order' })
  }
}
