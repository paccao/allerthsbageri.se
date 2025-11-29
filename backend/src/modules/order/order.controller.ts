import type { FastifyReply, FastifyRequest } from 'fastify'

import type { CreateOrderBody } from './order.schemas.ts'
import { createOrder } from './order.service.ts'
import { getOrderStatusOrDefault } from '../order-status/order-status.service.ts'
import { getPickupOccasion } from '../pickup-occasion/pickup-occasion.service.ts'
import { getOrCreateCustomer } from '../customer/customer.service.ts'

export async function createOrderHandler(
  request: FastifyRequest<{ Body: CreateOrderBody }>,
  reply: FastifyReply,
) {
  let { customer, pickupOccasionId, statusId, orderItems } = request.body

  try {
    const pickup = await getPickupOccasion(pickupOccasionId)
    if (!pickup) {
      throw new Error('Specified pickup occasion not found', {
        cause: { status: 400 },
      })
    }

    const now = Date.now()

    if (now < new Date(pickup.orderStart).getTime()) {
      throw new Error('Orders can not be created before orderStart', {
        cause: { status: 400 },
      })
    }

    if (now > new Date(pickup.orderEnd).getTime()) {
      throw new Error('Orders can not be created after orderEnd', {
        cause: { status: 400 },
      })
    }

    let orderStatus = await getOrderStatusOrDefault(statusId)

    // TODO: Require valid customer authentication before handling requests to POST /api/orders
    // TODO: Create customer accounts and log in or sign up in a previous request.
    const createdCustomer = await getOrCreateCustomer({
      name: customer.name,
      phone: customer.phone,
    })

    const createdOrder = createOrder(
      {
        customerId: createdCustomer.id,
        pickupOccasionId,
        statusId: orderStatus.id,
      },
      orderItems,
    )

    return reply.code(201).send(createdOrder)
  } catch (error: any) {
    request.log.error(error, error?.message)

    if (error?.cause?.status) {
      return reply
        .code(error.cause.status)
        .send({ message: error?.message, details: error?.cause?.details })
    }

    return reply.code(500).send({ message: 'Failed to create order' })
  }
}
