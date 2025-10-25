import type { FastifyReply, FastifyRequest } from 'fastify'
import type {
  CreateOrderStatusBody,
  UpdateOrderStatusBody,
} from './order-status.schemas.ts'
import {
  createOrderStatus,
  getOrderStatusById,
  listOrderStatuses,
  updateOrderStatus,
} from './order-status.service.ts'
import type { IdParams } from '#utils/common.schemas.ts'

export async function getOrderStatusByIdHandler(
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) {
  try {
    const orderStatus = await getOrderStatusById(request.params.id)

    if (!orderStatus) {
      return reply
        .code(404)
        .send({ message: 'Specified order status not found' })
    }

    return reply.code(200).send(orderStatus)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to get order status' })
  }
}

export async function listOrderStatusesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const orderStatuses = await listOrderStatuses()

    return reply.code(200).send(orderStatuses)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to list order statuses' })
  }
}

export async function createOrderStatusHandler(
  request: FastifyRequest<{ Body: CreateOrderStatusBody }>,
  reply: FastifyReply,
) {
  const { status, color } = request.body

  try {
    const orderStatus = await createOrderStatus({
      status,
      color,
    })
    return reply.code(201).send(orderStatus)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to create order status' })
  }
}

export async function updateOrderStatusHandler(
  request: FastifyRequest<{
    Params: IdParams
    Body: UpdateOrderStatusBody
  }>,
  reply: FastifyReply,
) {
  const { status, color } = request.body

  try {
    const orderStatus = await updateOrderStatus(request.params.id, {
      status,
      color,
    })

    if (!orderStatus) {
      return reply.code(404).send({ message: 'Order status does not exist' })
    }

    return reply.code(200).send(orderStatus)
  } catch (error: any) {
    request.log.error(error, error?.message)
    return reply.code(500).send({ message: 'Failed to update order status' })
  }
}
