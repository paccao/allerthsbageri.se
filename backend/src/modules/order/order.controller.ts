import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateOrderBody } from './order.schemas.ts'
import { createOrder, getProductById } from './order.service.ts'
import type { IdParams } from '#utils/common.schemas.ts'

export async function createOrderHandler(
  request: FastifyRequest<{ Body: CreateOrderBody }>,
  reply: FastifyReply,
) {
  const { customerId, pickupOccasionId, statusId } = request.body

  try {
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


export async function getProductsAvailabilityByIdHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  try {
    const product = await getProductById(request.params.id)

    console.dir("getProductsAvailabilityByIdHandler: ", product)

    if (!product) {
      return reply.code(404).send({ message: 'Specified product not found' })
    }

    return product.stock

  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to get information about product availability' })
  }
}