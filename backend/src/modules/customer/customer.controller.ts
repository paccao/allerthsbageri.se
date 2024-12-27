import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateCustomerBody } from './customer.schemas.ts'
import { createCustomer } from './customer.service.ts'

export async function createCustomerHandler(
  request: FastifyRequest<{ Body: CreateCustomerBody }>,
  reply: FastifyReply,
) {
  const { name, phone } = request.body

  try {
    const pickup = await createCustomer({
      name,
      phone,
    })
    return pickup
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create customer' })
  }
}
