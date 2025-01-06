import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  CreateCustomerBody,
  UpdateCustomerParams,
} from './customer.schemas.ts'
import { createCustomer, updateCustomer } from './customer.service.ts'

export async function createCustomerHandler(
  request: FastifyRequest<{ Body: CreateCustomerBody }>,
  reply: FastifyReply,
) {
  const { name, phone } = request.body

  try {
    const customer = await createCustomer({
      name,
      phone,
    })
    return customer
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create customer' })
  }
}

export async function updateCustomerHandler(
  request: FastifyRequest<{
    Body: CreateCustomerBody
    Params: UpdateCustomerParams
  }>,
  reply: FastifyReply,
) {
  const { name, phone } = request.body

  try {
    const customer = await updateCustomer(request.params.id, {
      name,
      phone,
    })
    return customer
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to update customer' })
  }
}
