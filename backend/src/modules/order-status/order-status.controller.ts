import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateOrderStatusBody } from './order-status.schemas.ts'
import { createOrderStatus } from './order-status.service.ts'

export async function createOrderStatusHandler(
  request: FastifyRequest<{ Body: CreateOrderStatusBody }>,
  reply: FastifyReply,
) {
  const { status, color } = request.body

  try {
    const orderStatus = await createOrderStatus({
      status,
      color,
    })
    return reply.code(201).send(orderStatus)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create order status' })
  }
}
