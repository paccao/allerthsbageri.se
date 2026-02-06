import { client } from './api'
import { query } from '$app/server'

export const getPickupOccasionsWithDetails = query(async () => {
  const [pickupOccasions, products, productDetails] = await Promise.all([
    client.GET('/api/pickup-occasions/'),
    client.GET('/api/products/'),
    client.GET('/api/product-details/'),
  ])

  if (pickupOccasions.error) {
    console.error(pickupOccasions.error)
  }
  if (products.error) {
    console.error(products.error)
  }
  if (productDetails.error) {
    console.error(productDetails.error)
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
        if (!details)
          throw new Error(
            'Oväntat fel, vi jobbar på det. Saknar productdetaljer för produktID: ' +
              product.id,
          )
        return { ...product, ...details }
      })

    return { ...pickupOccasion, products: mergedProducts }
  })
})
