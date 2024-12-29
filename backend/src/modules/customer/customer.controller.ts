import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateCustomerBody } from './customer.schemas.ts'
import { upsertCustomer } from './customer.service.ts'

export async function upsertCustomerHandler(
  request: FastifyRequest<{ Body: CreateCustomerBody }>,
  reply: FastifyReply,
) {
  const { name, phone } = request.body

  try {
    const customer = await upsertCustomer({
      name,
      phone,
    })
    return customer
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create customer' })
  }
}
