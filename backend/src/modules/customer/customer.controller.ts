import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  type CreateCustomerBody,
  type UpdateCustomerBody,
} from './customer.schemas.ts'
import type { IdParams } from '#utils/common.schemas.ts'
import type { DependencyContainer } from '#src/di-container.ts'

export function createCustomerController({
  customerService,
}: Pick<DependencyContainer, 'customerService'>) {
  async function createCustomerHandler(
    request: FastifyRequest<{ Body: CreateCustomerBody }>,
    reply: FastifyReply,
  ) {
    const { name, phone } = request.body

    try {
      const customer = await customerService.createCustomer({
        name,
        phone,
      })
      return reply.code(201).send(customer)
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply.code(500).send({ message: 'Failed to create customer' })
    }
  }

  async function listCustomersHandler(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
  ) {
    try {
      return await customerService.listCustomers()
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply.code(500).send({ message: 'Failed to list customers' })
    }
  }

  async function getCustomerHandler(
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply,
  ) {
    try {
      const customer = await customerService.getCustomer(request.params.id)

      if (!customer) {
        return reply.code(404).send({ message: 'Customer not found' })
      }

      return customer
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply.code(500).send({ message: 'Failed to get customer' })
    }
  }

  async function updateCustomerHandler(
    request: FastifyRequest<{
      Params: IdParams
      Body: UpdateCustomerBody
    }>,
    reply: FastifyReply,
  ) {
    const { name, phone } = request.body

    try {
      const customer = await customerService.updateCustomer(request.params.id, {
        name,
        phone,
      })

      if (!customer) {
        return reply.code(404).send({ message: 'Customer does not exist' })
      }

      return customer
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply.code(500).send({ message: 'Failed to update customer' })
    }
  }

  async function deleteCustomerHandler(
    request: FastifyRequest<{
      Params: IdParams
    }>,
    reply: FastifyReply,
  ) {
    try {
      await customerService.deleteCustomer(request.params.id)
      return reply.code(204).send()
    } catch (error: any) {
      request.log.error(error, error?.message)
      return reply.code(500).send({ message: 'Failed to delete customer' })
    }
  }

  return {
    createCustomerHandler,
    listCustomersHandler,
    getCustomerHandler,
    updateCustomerHandler,
    deleteCustomerHandler,
  }
}
