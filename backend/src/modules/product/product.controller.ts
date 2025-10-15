import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  createProduct,
  getProductStockById,
  updateProduct,
} from './product.service.ts'
import type { IdParams } from '#utils/common.schemas.ts'
import type { CreateProductBody, UpdateProductBody } from './product.schemas.ts'

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
    const product = createProduct({
      stock,
      price,
      maxPerCustomer,
      pickupOccasionId,
      productDetailsId,
    })

    if (product === null) {
      return reply.code(400).send({
        message: 'Could not find specified pickup occasion or product detail',
      })
    }

    return reply.code(201).send(product)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create product' })
  }
}

export async function updateProductHandler(
  request: FastifyRequest<{
    Params: IdParams
    Body: UpdateProductBody
  }>,
  reply: FastifyReply,
) {
  const { stock, price, maxPerCustomer, pickupOccasionId, productDetailsId } =
    request.body

  try {
    const product = await updateProduct(request.params.id, {
      stock,
      price,
      maxPerCustomer,
      pickupOccasionId,
      productDetailsId,
    })

    if (product === null) {
      return reply.code(400).send({
        message: 'Could not find specified pickup occasion or product detail',
      })
    }

    if (!product) {
      return reply.code(404).send({ message: 'Product does not exist' })
    }

    return reply.code(200).send(product)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to update product' })
  }
}
