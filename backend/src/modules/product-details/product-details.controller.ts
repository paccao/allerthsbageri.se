import type { FastifyReply, FastifyRequest } from 'fastify'
import { listProductDetails } from './product-details.service.ts'

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
