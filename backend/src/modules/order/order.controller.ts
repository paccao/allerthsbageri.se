import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateOrderBody } from './order.schemas.ts'
import { createOrder } from './order.service.ts'
import { getProductById } from '../product/product.service.ts'
import {
  getOrderStatus,
  listOrderStatuses,
} from '../order-status/order-status.service.ts'
import { getPickupOccasion } from '../pickup-occasion/pickup-occasion.service.ts'

// TODO: Should we let the API decide the statusId, and remove that from the request body?
// When calling the API from the public frontend, we always want to create a new order with the default status

export async function createOrderHandler(
  request: FastifyRequest<{ Body: CreateOrderBody }>,
  reply: FastifyReply,
) {
  let { customer, pickupOccasionId, statusId, orderItems } = request.body

  let usedDefaultStatus = false

  try {
    const pickup = await getPickupOccasion(pickupOccasionId)
    if (!pickup) {
      return reply
        .code(401)
        .send({ message: 'Specified pickup occasion not found' })
    }

    let defaultOrderStatusId: number

    if (!statusId) {
      const statuses = await listOrderStatuses()

      // Find all default values set in the db
      const defaultValues = statuses.filter((s) => s.isDefault === true)

      // Make sure we only have 1 default order status and set statusId
      if (defaultValues.length === 1) {
        defaultOrderStatusId = statuses.find(
          (status) => status.isDefault === true,
        )!.id
        statusId = defaultOrderStatusId
        usedDefaultStatus = true
      } else {
        return reply.code(500).send({
          message: 'An unexpected amount of default order statuses were found',
        })
      }
    }

    if (!usedDefaultStatus) {
      const orderStatus = await getOrderStatus(statusId)
      if (!orderStatus) {
        // fallback to the default order status if the user-provided StatusID doesnt exist
        statusId = defaultOrderStatusId
      }
    }

    // TODO: make the product checks parallel and abort early if anything errors.
    // Maybe use Promise.all().catch() and throw errors with the messages, to abort execution
    for (const item of orderItems) {
      const product = await getProductById(item.productId)
      if (!product)
        return reply.code(404).send({ message: 'Product not found' })

      if (product?.pickupOccasionId !== pickupOccasionId) {
        return reply.code(401).send({
          message: 'Order items should be from the selected pickup occasion',
        })
      }

      if (
        product.maxPerCustomer !== null &&
        item.count > product.maxPerCustomer
      ) {
        return reply.code(401).send({
          message: `Unable to order ${item.count} of product because max per customer is ${product.maxPerCustomer}`,
          details: { productId: product.id },
        })
      }

      if (product.stock < item.count) {
        // TODO: Send more detailed information here about which product is missing so we can improve the error on the client
        // IDEA: If you can only order a smaller amount, should we let the order go through but only order the available amount?
        // In that case we need to show a message and clearly indicate that we changed the order.
        // NOTE: Probably better to error and let the customer see the error client-side and decide if they want to order the remaining products.
        // This kind of feature only makes sense if customers could update their orders, but we don't want this for now to keep things simple.
        return reply.code(401).send({
          message:
            product.stock > 0
              ? `Unable to order ${item.count} of product because only ${product.stock} remains in stock`
              : `Unable to order ${item.count} of product is out of stock`,
          details: { productId: product.id, stock: product.stock },
        })
      }
    }

    // If the execution gets this far, the input is valid and we can create the customer
    // TODO: Maybe add upsert method for customer to allow reusing the existing customer
    // Or if we don't want to overwrite the name, we could use getCustomer() and then createCustomer(). However, upsert would be faster and cover more cases.
    // const createdCustomer = upsertCustomer()

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
