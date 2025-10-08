import type { FastifyReply, FastifyRequest } from 'fastify'
import { getProductStockById } from './product.service.ts'
import type { IdParams } from '#utils/common.schemas.ts'

export async function getProductStockByIdHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  try {
    const product = await getProductStockById(request.params.id)

    if (!product) {
      return reply.code(404).send({ message: 'Specified product not found' })
    }

    return { amount: product.stock }
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply
      .code(500)
      .send({ message: 'Failed to get information about product availability' })
  }
}
