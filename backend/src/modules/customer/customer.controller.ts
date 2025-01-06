import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateCustomerBody } from './customer.schemas.ts'
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  updateCustomer,
} from './customer.service.ts'
import type { IdParams } from '#utils/common.schemas.ts'

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
    return reply.code(201).send(customer)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create customer' })
  }
}

export async function getCustomerHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  try {
    const customer = await getCustomer(request.params.id)

    if (!customer) {
      return reply.code(404).send({ message: 'Customer not found' })
    }

    return customer
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create customer' })
  }
}

export async function updateCustomerHandler(
  request: FastifyRequest<{
    Body: CreateCustomerBody
    Params: IdParams
  }>,
  reply: FastifyReply,
) {
  const { name, phone } = request.body

  try {
    const customer = await updateCustomer(request.params.id, {
      name,
      phone,
    })

    if (!customer) {
      return reply
        .code(404)
        .send({ message: 'Failed to update customer: Customer does not exist' })
    }

    return customer
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to update customer' })
  }
}

export async function deleteCustomerHandler(
  request: FastifyRequest<{
    Params: IdParams
  }>,
  reply: FastifyReply,
) {
  try {
    await deleteCustomer(request.params.id)
    return reply.code(204).send()
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to delete customer' })
  }
}
