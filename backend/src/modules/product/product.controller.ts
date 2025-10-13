import type { FastifyReply, FastifyRequest } from 'fastify'
import { createProduct, getProductStockById } from './product.service.ts'
import type { IdParams } from '#utils/common.schemas.ts'
import type { CreateProductBody } from './product.schemas.ts'

export async function getProductStockByIdHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  try {
    const product = await getProductStockById(request.params.id)

    if (!product) {
      return reply.code(404).send({ message: 'Specified product not found' })
    }

    return { amount: product.stock }
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply
      .code(500)
      .send({ message: 'Failed to get information about product availability' })
  }
}

export async function createProductHandler(
  request: FastifyRequest<{ Body: CreateProductBody }>,
  reply: FastifyReply,
) {
  const { stock, price, maxPerCustomer, pickupOccasionId, productDetailsId } =
    request.body

  try {
    const product = await createProduct({
      stock,
      price,
      maxPerCustomer,
      pickupOccasionId,
      productDetailsId,
    })
    return reply.code(201).send(product)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create product' })
  }
}
