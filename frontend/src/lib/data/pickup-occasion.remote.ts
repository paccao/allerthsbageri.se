import { client } from './api-client.server'
import { query } from '$app/server'
import { omit } from '$lib/utils'

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
      orderStart: new Date(pickupOccasion.orderStart),
      orderEnd: new Date(pickupOccasion.orderEnd),
      pickupStart: new Date(pickupOccasion.pickupStart),
      pickupEnd: new Date(pickupOccasion.pickupEnd),
      products: mergedProducts,
    }
  })
})
