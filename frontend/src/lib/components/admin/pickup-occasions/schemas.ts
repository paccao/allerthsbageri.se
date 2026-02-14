import type { getPickupOccasionsWithDetails } from '$lib/data/pickup-occasion.remote'

export type PickupOccasion = Awaited<
  ReturnType<typeof getPickupOccasionsWithDetails>
>[number]
export type Product = PickupOccasion['products'][number]
