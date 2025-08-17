import { SvelteMap } from 'svelte/reactivity'

import { clearHash } from '$lib/utils'
import type { PickupOccasion, Product } from './booking-form.svelte'

export type Order = {
  pickupOccasionId: number | null
  items: Map<Product['id'], number>
}

const orderedSteps = [
  { id: 'tid', title: 'Välj upphämtningstillfälle' },
  { id: 'varor', title: 'Beställ produkter' },
  {
    id: 'kund',
    title: 'Dina kontaktuppgifter',
    nextButtonLabel: 'Skicka beställning',
  },
  { id: 'tack', title: 'Tack för din beställning!' },
] as const
const defaultStepId = orderedSteps[0].id

export type StepId = (typeof orderedSteps)[number]['id']
type Step = { id: StepId; title: string; nextButtonLabel?: string }

const steps = orderedSteps.reduce(
  (acc, step) => {
    acc[step.id as StepId] = step
    return acc
  },
  {} as Record<StepId, Step>,
)

export class BookingState {
  order = $state<Order>({
    pickupOccasionId: null,
    items: new SvelteMap(),
  })

  customer = $state({
    name: '',
    email: '',
    phone: '',
  })

  validators: Record<StepId, () => boolean> = {
    tid: () => Number.isInteger(this.order.pickupOccasionId),
    varor: () => this.order.items.size > 0,
    // TODO: Improve validation for customer data, maybe using a zod schema
    kund: () =>
      this.customer.name.trim().length > 0 &&
      this.customer.email.trim().length > 0 &&
      this.customer.phone.trim().length > 0,
    tack: () => true,
  }

  orderedSteps = orderedSteps
  visibleSteps = orderedSteps.slice(0, -1)

  stepId = $state<StepId>(this.getStepIdFromHash(window.location.hash))!
  step = $derived(steps[this.stepId])
  stepIndex = $derived(orderedSteps.findIndex(({ id }) => id === this.stepId))
  prevStepId = $derived(orderedSteps[this.stepIndex - 1]?.id)
  nextStepId = $derived(orderedSteps[this.stepIndex + 1]?.id)
  isLastStep = $derived(this.stepId === orderedSteps.at(-1)!.id)

  pickupOccasions: PickupOccasion[]
  pickupOccasion?: PickupOccasion

  constructor(pickupOccasions: PickupOccasion[]) {
    this.pickupOccasions = pickupOccasions
    this.pickupOccasion = $derived(
      pickupOccasions.find(({ id }) => id === this.order.pickupOccasionId),
    )
  }

  getStepIdFromHash(hash: string) {
    // Ensure the stepId is valid and that all previous steps have been completed
    const id = steps[hash.slice(1) as StepId]?.id
    if (id && this.canNavigateToStep(id)) {
      return id
    }
    // Don't show a hash for the default stepId
    clearHash()
    return defaultStepId
  }

  setStepIdFromHash(hash: string) {
    this.stepId = this.getStepIdFromHash(hash)
  }

  canNavigateToStep(id: StepId) {
    switch (id) {
      case defaultStepId:
        return true
      case 'varor':
        return this.validators.tid()
      case 'kund':
        return this.validators.tid() && this.validators.varor()
      case 'tack':
        return (
          this.validators.tid() &&
          this.validators.varor() &&
          this.validators.kund()
        )
      default:
        return false
    }
  }

  selectPickupOccasion(pickup: PickupOccasion) {
    location.href = `#${this.nextStepId}`
    // TODO: If selecting a different pickupOccasionId, then warn the customer about any differences in products
    // Otherwise, reset the order items and start fresh
    this.order.pickupOccasionId = pickup.id
  }

  getProductCount(id: Product['id']) {
    return this.order.items.get(id) ?? 0
  }

  setProductCount(id: Product['id'], count: number) {
    this.order.items.set(id, count)
  }

  addProduct(id: Product['id'], count: number) {
    const current = this.order.items.get(id)
    const newCount = (current ?? 0) + count
    this.order.items.set(id, newCount)
  }

  removeProduct(id: Product['id'], count: number) {
    const current = this.order.items.get(id)
    const newCount = (current ?? 0) - count

    if (newCount > 0) {
      this.order.items.set(id, newCount)
    } else {
      this.order.items.delete(id)
    }
  }
}
