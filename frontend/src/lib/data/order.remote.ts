import { command } from '$app/server'
import { error } from '@sveltejs/kit'
import z from 'zod'
import { client } from './api-client'

const nameMaxLength = 200
const createCustomerBodySchema = z.object({
  name: z.string().max(nameMaxLength),
  phone: z.string(),
})

const createOrderItemBodySchema = z.object({
  /** The max value should be validated in the handler */
  count: z.int().min(0),
  productId: z.int().min(1),
})

const createOrderBodySchema = z.object({
  customer: createCustomerBodySchema,
  pickupOccasionId: z.int().min(1),
  statusId: z.int().min(1).optional(),
  orderItems: z
    .array(createOrderItemBodySchema)
    .min(1, 'Must contain at least one order item'),
})

export const submitOrder = command(createOrderBodySchema, async (order) => {
  // verify if the data was correct, and forward errors if it failed
  const response = await client.POST('/api/orders/', {
    body: order,
  })

  if (response.error) {
    console.error('Failed to create order', response.error)
    error(400, response.error)
  }

  return response.data
})
