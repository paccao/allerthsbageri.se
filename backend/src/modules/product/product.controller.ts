import type { FastifyReply, FastifyRequest } from 'fastify'

import type { IdParams } from '#utils/common.schemas.ts'
import type { CreateProductBody, UpdateProductBody } from './product.schemas.ts'
import type { DependencyContainer } from '#src/di-container.ts'

export function createProductController(
  productService: DependencyContainer['productService'],
) {
  async function getProductByIdHandler(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
  ) {
    try {
      const product = await productService.getProductById(request.params.id)

      if (!product) {
        return reply.code(404).send({ message: 'Specified product not found' })
      }

      return reply.code(200).send(product)
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply.code(500).send({ message: 'Failed to get product' })
    }
  }

  async function listProductsHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    try {
      const products = await productService.listProducts()

      return reply.code(200).send(products)
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply.code(500).send({ message: 'Failed to list products' })
    }
  }

  async function createProductHandler(
    request: FastifyRequest<{ Body: CreateProductBody }>,
    reply: FastifyReply,
  ) {
    const { stock, price, maxPerCustomer, pickupOccasionId, productDetailsId } =
      request.body

    try {
      const product = productService.createProduct({
        stock,
        price,
        maxPerCustomer,
        pickupOccasionId,
        productDetailsId,
      })

      // TODO: Throw detailed errors in the service instead and only handle the generic error up here
      if (product === null) {
        return reply.code(400).send({
          message:
            'Could not find specified pickup occasion or product detail in product body',
        })
      }

      return reply.code(201).send(product)
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply.code(500).send({ message: 'Failed to create product' })
    }
  }

  async function updateProductHandler(
    request: FastifyRequest<{
      Params: IdParams
      Body: UpdateProductBody
    }>,
    reply: FastifyReply,
  ) {
    const { stock, price, maxPerCustomer, pickupOccasionId, productDetailsId } =
      request.body

    try {
      const product = productService.updateProduct(request.params.id, {
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

  return {
    getProductByIdHandler,
    listProductsHandler,
    createProductHandler,
    updateProductHandler,
  }
}
