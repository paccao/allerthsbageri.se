import type { FastifyInstance } from 'fastify'
import {
  getProductByIdHandler,
  createProductHandler,
  updateProductHandler,
} from './product.controller.ts'
import {
  createProductBodySchema,
  getProductSchema,
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
    getProductByIdHandler,
  )

  app.post<{ Body: CreateProductBody }>(
    '/',
    {
      schema: {
        body: createProductBodySchema,
        response: {
          201: createProductBodySchema,
          ...getErrorResponseSchemas(400, 401, 500),
        },
        tags,
      },
    },
    createProductHandler,
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
    updateProductHandler,
  )
}
