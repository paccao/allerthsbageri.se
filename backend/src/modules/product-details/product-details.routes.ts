import type { FastifyInstance } from 'fastify'
import {
  getProductDetailHandler,
  listProductDetailsHandler,
} from './product-details.controller.ts'
import {
  getProductDetailSchema,
  listProductDetailsSchema,
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
}
