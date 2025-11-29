import type { FastifyInstance } from 'fastify'

import {
  createProductDetailHandler,
  getProductDetailHandler,
  listProductDetailsHandler,
  updateProductDetailHandler,
} from './product-details.controller.ts'
import {
  createProductDetailBodySchema,
  getProductDetailSchema,
  listProductDetailsSchema,
  updateProductDetailBodySchema,
  type CreateProductDetailBody,
  type UpdateProductDetailBody,
} from './product-details.schemas.ts'
import { getTags } from '#config/openapi.ts'
import {
  getErrorResponseSchemas,
  idParamsSchema,
  type IdParams,
} from '#utils/common.schemas.ts'

const tags = getTags('product_details')

export async function productDetailsRoutes(app: FastifyInstance) {
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
    listProductDetailsHandler,
  )

  app.get<{ Params: IdParams }>(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        response: {
          200: getProductDetailSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    getProductDetailHandler,
  )

  app.post<{ Body: CreateProductDetailBody }>(
    '/',
    {
      schema: {
        body: createProductDetailBodySchema,
        response: {
          201: createProductDetailBodySchema,
          ...getErrorResponseSchemas(401, 500),
        },
        tags,
      },
    },
    createProductDetailHandler,
  )

  app.patch<{ Body: UpdateProductDetailBody; Params: IdParams }>(
    '/:id',
    {
      schema: {
        body: updateProductDetailBodySchema,
        params: idParamsSchema,
        response: {
          200: getProductDetailSchema,
          ...getErrorResponseSchemas(401, 404, 500),
        },
        tags,
      },
    },
    updateProductDetailHandler,
  )
}
