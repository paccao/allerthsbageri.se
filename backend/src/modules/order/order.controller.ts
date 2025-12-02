import type { FastifyReply, FastifyRequest } from 'fastify'

import type { CreateOrderBody } from './order.schemas.ts'
import type { DependencyContainer } from '#src/di-container.ts'

export function createOrderController({
  customerService,
  pickupOccasionService,
  orderStatusService,
  orderService,
}: Pick<
  DependencyContainer,
  | 'customerService'
  | 'pickupOccasionService'
  | 'orderStatusService'
  | 'orderService'
>) {
  async function createOrderHandler(
    request: FastifyRequest<{ Body: CreateOrderBody }>,
    reply: FastifyReply,
  ) {
    let { customer, pickupOccasionId, statusId, orderItems } = request.body

    try {
      const pickup =
        await pickupOccasionService.getPickupOccasion(pickupOccasionId)
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

      let orderStatus =
        await orderStatusService.getOrderStatusOrDefault(statusId)

      // TODO: Require valid customer authentication before handling requests to POST /api/orders
      // TODO: Create customer accounts and log in or sign up in a previous request.
      const createdCustomer = await customerService.getOrCreateCustomer({
        name: customer.name,
        phone: customer.phone,
      })

      const createdOrder = orderService.createOrder(
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

  return {
    createOrderHandler,
  }
}
