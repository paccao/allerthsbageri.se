import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  getProductDetail,
  listProductDetails,
} from './product-details.service.ts'
import type { IdParams } from '#utils/common.schemas.ts'

export async function getProductDetailHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  try {
    const productDetail = await getProductDetail(request.params.id)

    if (!productDetail) {
      return reply.code(404).send({
        message: 'Product detail not found',
      })
    }

    return productDetail
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to get product detail' })
  }
}

export async function listProductDetailsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const productDetails = await listProductDetails()

    return productDetails
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to list product details' })
  }
}
