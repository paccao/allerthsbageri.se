import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  createProductDetail,
  getProductDetail,
  listProductDetails,
  updateProductDetail,
} from './product-details.service.ts'
import type { IdParams } from '#utils/common.schemas.ts'
import type {
  CreateProductDetailBody,
  UpdateProductDetailBody,
} from './product-details.schemas.ts'

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

export async function createProductDetailHandler(
  request: FastifyRequest<{ Body: CreateProductDetailBody }>,
  reply: FastifyReply,
) {
  const { name, description, image, vatPercentage } = request.body

  try {
    const productDetail = await createProductDetail({
      name,
      description,
      image,
      vatPercentage,
    })
    return reply.code(201).send(productDetail)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create product detail' })
  }
}

export async function updateProductDetailHandler(
  request: FastifyRequest<{
    Params: IdParams
    Body: UpdateProductDetailBody
  }>,
  reply: FastifyReply,
) {
  const { name, description, image, vatPercentage } = request.body

  try {
    const productDetail = await updateProductDetail(request.params.id, {
      name,
      description,
      image,
      vatPercentage,
    })

    if (!productDetail) {
      return reply.code(404).send({ message: 'Product detail does not exist' })
    }

    return productDetail
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply
      .code(500)
      .send({ message: 'Failed to update product detail occasion' })
  }
}
