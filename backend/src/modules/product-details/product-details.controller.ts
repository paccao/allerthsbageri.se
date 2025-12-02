import type { FastifyReply, FastifyRequest } from 'fastify'

import type { IdParams } from '#utils/common.schemas.ts'
import type {
  CreateProductDetailsBody,
  UpdateProductDetailsBody,
} from './product-details.schemas.ts'
import type { DependencyContainer } from '#src/di-container.ts'

export function createProductDetailsController({
  productDetailsService,
}: Pick<DependencyContainer, 'productDetailsService'>) {
  async function getProductDetailsHandler(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
  ) {
    try {
      const productDetails = await productDetailsService.getProductDetails(
        request.params.id,
      )

      if (!productDetails) {
        return reply.code(404).send({
          message: 'Product detail not found',
        })
      }

      return productDetails
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply.code(500).send({ message: 'Failed to get product detail' })
    }
  }

  async function listProductDetailsHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      const productDetails = await productDetailsService.listProductDetails()

      return productDetails
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply.code(500).send({ message: 'Failed to list product details' })
    }
  }

  async function createProductDetailsHandler(
    request: FastifyRequest<{ Body: CreateProductDetailsBody }>,
    reply: FastifyReply,
  ) {
    const { name, description, image, vatPercentage } = request.body

    try {
      const productDetails = await productDetailsService.createProductDetails({
        name,
        description,
        image,
        vatPercentage,
      })
      return reply.code(201).send(productDetails)
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply
        .code(500)
        .send({ message: 'Failed to create product detail' })
    }
  }

  async function updateProductDetailsHandler(
    request: FastifyRequest<{
      Params: IdParams
      Body: UpdateProductDetailsBody
    }>,
    reply: FastifyReply,
  ) {
    const { name, description, image, vatPercentage } = request.body

    try {
      const productDetails = await productDetailsService.updateProductDetails(
        request.params.id,
        {
          name,
          description,
          image,
          vatPercentage,
        },
      )

      if (!productDetails) {
        return reply
          .code(404)
          .send({ message: 'Product detail does not exist' })
      }

      return productDetails
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply
        .code(500)
        .send({ message: 'Failed to update product detail' })
    }
  }

  return {
    getProductDetailsHandler,
    listProductDetailsHandler,
    createProductDetailsHandler,
    updateProductDetailsHandler,
  }
}
