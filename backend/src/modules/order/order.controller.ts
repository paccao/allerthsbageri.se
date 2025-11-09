import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateOrderBody } from './order.schemas.ts'
import { createOrder } from './order.service.ts'
import { getProductById } from '../product/product.service.ts'
import { getOrderStatus } from '../order-status/order-status.service.ts'
import { getPickupOccasion } from '../pickup-occasion/pickup-occasion.service.ts'

// TODO: Should we let the API decide the statusId, and remove that from the request body?
// When calling the API from the public frontend, we always want to create a new order with the default status

export async function createOrderHandler(
  request: FastifyRequest<{ Body: CreateOrderBody }>,
  reply: FastifyReply,
) {
  const { customer, pickupOccasionId, orderItems, statusId } = request.body

  try {
    const statusRes = await getOrderStatus(statusId)
    if (!statusRes) {
      return reply
        .code(404)
        .send({ message: 'Specified order status not found' })
    }

    // TODO: make the product checks parallel and abort early if anything errors.
    // Maybe use Promise.all().catch() and throw errors with the messages, to abort execution
    for (const item of orderItems) {
      const product = await getProductById(item.productId)
      if (!product)
        return reply.code(401).send({ message: 'Product not found' })

      if (product?.pickupOccasionId !== pickupOccasionId) {
        return reply.code(401).send({
          message: 'Order items should be from the selected pickup occasion',
        })
      }

      if (product.stock === 0) {
        return reply.code(401).send({
          message: 'Product is out of stock',
          details: { productId: product.id },
        })
      }

      if (product.stock < item.count) {
        // TODO: Send more detailed information here about which product is missing so we can improve the error on the client
        // TODO: If stock is 0, then error with out of stock
        // TODO: If you can only order a smaller amount, let the order go through but only order the available amount?
        // In that case we need to show a message and clearly indicate that we changed the order. Probably better to error and let the customer decide if they want to order the remaining products.
        return reply.code(401).send({
          message:
            'Unable to order {X} of product because only {Y} remains in stock',
          message2: `Unable to order ${item.count} of product because only ${product.stock} remains in stock`,
          details: { productId: product.id, stock: product.stock },
        })
      }

      // TODO: Validate maxPerCustomer for the product
    }

    // TODO: Move this early since it's a simple check that affects everything else
    const pickupRes = await getPickupOccasion(pickupOccasionId)
    if (!pickupRes)
      return reply
        .code(404)
        .send({ message: 'Specified pickup occasion not found' })

    // TODO: If products are valid, create the customer

    // TODO: If customer and order items are all valid
    // 1) create the order
    // 2) create the order items

    // TODO: respond with the { orderId } of the created order
    return reply.code(201).send({ orderId: 'TODO' })
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create order' })
  }
}
