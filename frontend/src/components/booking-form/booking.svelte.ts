import type { PickupOccasion } from './booking-form.svelte'

export type Order = {
  pickupOccasionId: number | null
  items: []
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
    items: [],
  })

  customer = $state({
    name: '',
    email: '',
    phone: '',
  })

  validators: Record<StepId, () => boolean> = {
    tid: () => Number.isInteger(this.order.pickupOccasionId),
    varor: () => this.order.items.length > 0,
    // TODO: Improve validation for customer data, maybe using a zod schema
    kund: () =>
      this.customer.name.trim().length > 0 &&
      this.customer.email.trim().length > 0 &&
      this.customer.phone.trim().length > 0,
    tack: () => true,
  }

  orderedSteps = orderedSteps
  visibleSteps = orderedSteps.slice(0, -1)

  stepId = $state<StepId>(this.getStepIdFromURL(new URL(window.location.href)))!
  step = $derived(steps[this.stepId])
  stepIndex = $derived(orderedSteps.findIndex(({ id }) => id === this.stepId))
  prevStepId = $derived(orderedSteps[this.stepIndex - 1]?.id)
  nextStepId = $derived(orderedSteps[this.stepIndex + 1]?.id)
  isLastStep = $derived(this.stepId === orderedSteps.at(-1)!.id)

  pickupOccasions: PickupOccasion[]

  constructor(pickupOccasions: PickupOccasion[]) {
    this.pickupOccasions = pickupOccasions
  }

  getStepIdFromURL(url: URL) {
    return steps[url.hash.slice(1) as StepId]?.id ?? defaultStepId
  }

  setStepIdFromURL(url: URL) {
    this.stepId = this.getStepIdFromURL(url)
  }

  selectPickupOccasion(pickup: PickupOccasion) {
    location.href = `#${this.nextStepId}`
    this.order.pickupOccasionId = pickup.id
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
}
