import type { FastifyInstance } from 'fastify'

import {
  createProductDetailsBodySchema,
  getProductDetailsSchema,
  listProductDetailsSchema,
  updateProductDetailsBodySchema,
  type CreateProductDetailsBody,
  type UpdateProductDetailsBody,
} from './product-details.schemas.ts'
import { getTags } from '#config/openapi.ts'
import {
  getErrorResponseSchemas,
  idParamsSchema,
  type IdParams,
} from '#utils/common.schemas.ts'

const tags = getTags('product_details')

export async function productDetailsRoutes(app: FastifyInstance) {
  const { productDetailsController } = app.diContainer

  app.get(
    '/',
    {
      schema: {
        response: {
          200: listProductDetailsSchema,
          ...getErrorResponseSchemas(401, 500),
        },
        tags,
      },
    },
    productDetailsController.listProductDetailsHandler,
  )

  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        response: {
          200: getProductDetailsSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    productDetailsController.getProductDetailsHandler,
  )

  app.post<{ Body: CreateProductDetailsBody }>(
    '/',
    {
      schema: {
        body: createProductDetailsBodySchema,
        response: {
          201: createProductDetailsBodySchema,
          ...getErrorResponseSchemas(401, 500),
        },
        tags,
      },
    },
    productDetailsController.createProductDetailsHandler,
  )

  app.patch<{ Body: UpdateProductDetailsBody; Params: IdParams }>(
    '/:id',
    {
      schema: {
        body: updateProductDetailsBodySchema,
        params: idParamsSchema,
        response: {
          200: getProductDetailsSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    productDetailsController.updateProductDetailsHandler,
  )
}
