import { FastifyInstance } from 'fastify'
import { createCustomerHandler } from './customer.controller.ts'
import {
  CreateCustomerBody,
  createCustomerBodySchema,
} from './customer.schemas.ts'
import { getTags } from '@/utils/openAPI.ts'

const tags = getTags('customers')

export async function customerRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateCustomerBody }>(
    '/',
    {
      schema: {
        body: createCustomerBodySchema,
        tags,
      },
    },
    createCustomerHandler,
  )
}
