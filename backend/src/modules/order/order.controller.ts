import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateOrderBody } from './order.schemas.ts'
import { createOrder } from './order.service.ts'
import { getProductById } from '../product/product.service.ts'
import { getOrderStatus } from '../order-status/order-status.service.ts'
import { getPickupOccasion } from '../pickup-occasion/pickup-occasion.service.ts'

export async function createOrderHandler(
  request: FastifyRequest<{ Body: CreateOrderBody }>,
  reply: FastifyReply,
) {
  const { customer, pickupOccasionId, orderItems, statusId } = request.body

  try {
    const statusRes = await getOrderStatus(statusId)
    if (!statusRes) {
      return reply.code(404).send('Specified order status not found')
    }

    let productRes
    orderItems.forEach(async (item) => {
      productRes = await getProductById(item.productId)
      if (!productRes) {
        return reply.code(404).send('Specified product not found')
      }
    })

    const pickupRes = await getPickupOccasion(pickupOccasionId)
    if (!pickupRes)
      return reply.code(404).send('Specified pickup occasion not found')


    return reply.code(201).send()
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create order' })
  }
}
