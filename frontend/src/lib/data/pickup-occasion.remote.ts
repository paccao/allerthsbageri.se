import { client } from './api-client'
import { query } from '$app/server'
import { omit } from '$lib/utils'
import { parseAbsoluteToLocal } from '@internationalized/date'
import z from 'zod'

export const getPickupOccasionsWithDetails = query(async () => {
  const [pickupOccasions, products, productDetails] = await Promise.all([
    client.GET('/api/pickup-occasions/'),
    client.GET('/api/products/'),
    client.GET('/api/product-details/'),
  ])
  if (pickupOccasions.error) {
    console.error('Failed to fetch pickupOccasions', pickupOccasions.error)
  }
  if (products.error) {
    console.error('Failed to fetch products', products.error)
  }
  if (productDetails.error) {
    console.error('Failed to fetch productDetails', productDetails.error)
  }

  if (!pickupOccasions.data || !products.data || !productDetails.data) {
    throw new Error(
      'Tyvärr kunde vi inte ladda in information om upphämtningstillfällen, försök igen senare.',
    )
  }

  return pickupOccasions.data.map((pickupOccasion) => {
    const mergedProducts = products.data
      .filter((product) => product.pickupOccasionId === pickupOccasion.id)
      .map((product) => {
        const details = productDetails.data.find(
          (detail) => detail.id === product.productDetailsId,
        )
        if (!details) {
          throw new Error(
            'Oväntat fel, vi jobbar på det. Saknar productdetaljer för produktID: ' +
              product.id,
          )
        }

        // Simplify structure of products by merging with details.
        // NOTE: It's important to omit the product details ID to avoid overwriting the product ID.
        return { ...product, ...omit(details, new Set(['id'])) }
      })

    return {
      ...pickupOccasion,
      orderStart: parseAbsoluteToLocal(pickupOccasion.orderStart),
      orderEnd: parseAbsoluteToLocal(pickupOccasion.orderEnd),
      pickupStart: parseAbsoluteToLocal(pickupOccasion.pickupStart),
      pickupEnd: parseAbsoluteToLocal(pickupOccasion.pickupEnd),
      products: mergedProducts,
    }
  })
})

export const updatePickupOccasion = query(
  z.object({
    id: z.number(),
    name: z.string().max(200),
    location: z.string().max(150),
    orderStart: z.string(),
    orderEnd: z.string(),
    pickupStart: z.string(),
    pickupEnd: z.string(),
  }),
  async ({
    id,
    name,
    location,
    orderStart,
    orderEnd,
    pickupStart,
    pickupEnd,
  }) => {
    return await client.PATCH('/api/pickup-occasions/{id}', {
      params: {
        path: {
          id,
        },
      },
      body: { name, location, orderStart, orderEnd, pickupStart, pickupEnd },
    })
  },
)
