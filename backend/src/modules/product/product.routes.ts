import type { FastifyInstance } from 'fastify'

import {
  createProductBodySchema,
  getProductSchema,
  listProductsSchema,
  updateProductBodySchema,
  type CreateProductBody,
  type UpdateProductBody,
} from './product.schemas.ts'
import { getTags } from '#config/openapi.ts'
import {
  getErrorResponseSchemas,
  idParamsSchema,
  type IdParams,
} from '#utils/common.schemas.ts'

const tags = getTags('products')

export async function productRoutes(app: FastifyInstance) {
  const { productController } = app.diContainer

  app.get(
    '/',
    {
      schema: {
        response: {
          200: listProductsSchema,
          ...getErrorResponseSchemas(401, 500),
        },
        tags,
      },
    },
    productController.listProductsHandler,
  )

  app.post<{ Body: CreateProductBody }>(
    '/',
    {
      schema: {
        body: createProductBodySchema,
        response: {
          201: getProductSchema,
          ...getErrorResponseSchemas(400, 401, 500),
        },
        tags,
      },
    },
    productController.createProductHandler,
  )

  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        response: {
          200: getProductSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    productController.getProductByIdHandler,
  )

  app.patch<{ Body: UpdateProductBody; Params: IdParams }>(
    '/:id',
    {
      schema: {
        body: updateProductBodySchema,
        params: idParamsSchema,
        response: {
          200: getProductSchema,
          ...getErrorResponseSchemas(400, 401, 404, 500),
        },
        tags,
      },
    },
    productController.updateProductHandler,
  )
}
