import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateOrderBody } from './order.schemas.ts'
import { createOrder } from './order.service.ts'
import { getProductById } from '../product/product.service.ts'
import { getOrderStatusOrDefault } from '../order-status/order-status.service.ts'
import { createOrderItems } from '../order-item/order-item.service.ts'
import { getPickupOccasion } from '../pickup-occasion/pickup-occasion.service.ts'
import { getOrCreateCustomer } from '../customer/customer.service.ts'
import type { Product } from '../product/product.schemas.ts'

export async function createOrderHandler(
  request: FastifyRequest<{ Body: CreateOrderBody }>,
  reply: FastifyReply,
) {
  let { customer, pickupOccasionId, statusId, orderItems } = request.body

  try {
    const pickup = await getPickupOccasion(pickupOccasionId)
    if (!pickup) {
      return reply
        .code(400)
        .send({ message: 'Specified pickup occasion not found' })
    }

    let orderStatus = await getOrderStatusOrDefault(statusId)

    // TODO: make the product checks parallel and abort early if anything errors.
    // Maybe use Promise.all().catch() and throw errors with the messages, to abort execution

    // TODO: Handle "concurrent orders" so that if stock runs out when a customer has ordered, they will not get a product doesnt exist
    // BullMQ

    const products: Record<Product['id'], Product> = {}

    for (const item of orderItems) {
      const product = await getProductById(item.productId)
      if (!product) {
        return reply.code(400).send({ message: 'Product not found' })
      }

      if (product?.pickupOccasionId !== pickupOccasionId) {
        return reply.code(400).send({
          message: 'Order items should be from the selected pickup occasion',
        })
      }

      if (
        product.maxPerCustomer !== null &&
        item.count > product.maxPerCustomer
      ) {
        return reply.code(400).send({
          message: `Unable to order ${item.count} of product because max per customer is ${product.maxPerCustomer}`,
          details: { productId: product.id },
        })
      }

      if (product.stock < item.count) {
        return reply.code(400).send({
          message:
            product.stock > 0
              ? `Unable to order ${item.count} of product because only ${product.stock} remains in stock`
              : `Unable to order ${item.count} of product is out of stock`,
          details: { productId: product.id, stock: product.stock },
        })
      }

      products[product.id] = product
    }

    // If the execution gets this far, the input is valid and we can create the customer
    // TODO: Require valid customer authentication before handling requests to POST /api/orders
    // TODO: Create customer accounts and log in or sign up in a previous request.
    const createdCustomer = await getOrCreateCustomer({
      name: customer.name,
      phone: customer.phone,
    })

    // TODO: Use a transaction to create order, order items and update products to ensure the DB is consistent.

    const createdOrder = await createOrder({
      customerId: createdCustomer.id,
      pickupOccasionId,
      statusId: orderStatus.id,
      createdAt: Date.now().toString(),
    })

    await createOrderItems(
      orderItems.map((item) => ({
        ...item,
        orderId: createdOrder.id,
        price: products[item.productId]!.price,
      })),
    )

    // TODO: update products for the pickup occasion to reduce the available stock

    return reply.code(201).send({ orderId: createdOrder.id })
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create order' })
  }
}
