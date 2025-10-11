import type { FastifyInstance } from 'fastify'
import { listProductDetailsHandler } from './product-details.controller.ts'
import { listProductDetailsSchema } from './product-details.schemas.ts'
import { getTags } from '#config/openapi.ts'
import { getErrorResponseSchemas } from '#utils/common.schemas.ts'

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
}
