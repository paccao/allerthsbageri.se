import { z } from 'zod'
import { PersistedState } from 'runed'
import type { PickupOccasion, Product } from './booking-form.svelte'
import type { ConfirmDialogState } from './confirm-dialog.svelte'
import { weekdayAndDate } from '$lib/datetime'

const customerSchema = z.object({
  name: z.string().trim(),
  email: z.email().trim(),
  phone: z.e164(),
})

export type Order = {
  pickupOccasionId: number | null
  items: Record<Product['id'], number>
}

const orderedSteps = [
  { id: 'varor', title: 'Välj upphämtningstillfälle och produkter' },
  {
    id: 'order',
    title: 'Bekräfta beställning',
    nextButtonLabel: 'Beställ',
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

function getConfirmDialogTexts(next: PickupOccasion) {
  return {
    title: `Vill du byta upphämtningstillfälle till ${weekdayAndDate.format(next.startTime).replace('.', '')}?`,
    description: `Om du vill ha produkter från flera upphämtningstillfällen så är du varmt välkommen att göra flera separata beställningar.`,
  }
}

function clearHash() {
  history.replaceState(
    '',
    document.title,
    window.location.pathname + window.location.search,
  )
}

export class BookingState {
  #order = new PersistedState<Order>('order', {
    pickupOccasionId: null,
    items: {},
  })
  #customer = new PersistedState('customer', {
    name: '',
    email: '',
    phone: '',
  })

  /**
   * If set, a confirmation dialog will be shown to prompt the user
   * before proceeding with actions that otherwise might cause data loss.
   *
   * This approachs allows the UI to be rendered declaratively,
   * separate from the state management.
   */
  #confirmDialog: ConfirmDialogState | null = $state(null)

  get order() {
    return this.#order.current
  }

  get customer() {
    return this.#customer.current
  }

  get confirmDialog() {
    return this.#confirmDialog
  }

  pickupOccasions: PickupOccasion[]
  /** Currently selected pickupOccasion */
  pickupOccasion?: PickupOccasion

  #validators: Record<StepId, () => boolean> = {
    varor: () =>
      Number.isInteger(this.order.pickupOccasionId) &&
      Object.values(this.order.items).some((amount) => amount > 0),
    // TODO: We could change the validatedSteps to store errors which could be shown in the UI
    // This way, we could still detect which steps are valid by checking they don't have any errors
    order: () => {
      return customerSchema.safeParse(this.customer).success
    },
    tack: () => true,
  }

  visibleSteps = orderedSteps.slice(0, -1)

  /** Stores a boolean for each step, indicating which steps are valid */
  #validatedSteps = $derived(
    orderedSteps.map(({ id }) => this.#validators[id]()),
  )
  /** Maps stepIds to a boolean, indicating which steps are enabled */
  #enabledSteps = $derived(
    orderedSteps.reduce(
      (enabledSteps, step) => {
        enabledSteps[step.id] = this.#isStepEnabled(step.id)
        return enabledSteps
      },
      {} as Record<StepId, boolean>,
    ),
  )
  stepId = $state(this.getStepIdFromHash(window.location.hash))
  step = $derived(steps[this.stepId])
  stepIndex = $derived(orderedSteps.findIndex(({ id }) => id === this.stepId))
  prevStepId = $derived(orderedSteps[this.stepIndex - 1]?.id)
  nextStepId = $derived(orderedSteps[this.stepIndex + 1]?.id)
  isLastStep = $derived(this.stepId === orderedSteps.at(-1)!.id)

  constructor(pickupOccasions: PickupOccasion[]) {
    this.pickupOccasions = pickupOccasions
    this.pickupOccasion = $derived(
      pickupOccasions.find(({ id }) => id === this.order.pickupOccasionId),
    )
  }

  getStepIdFromHash(hash: string) {
    // Ensure the stepId is valid and that all previous steps have been completed
    const id = steps[hash.slice(1) as StepId]?.id
    if (id && this.#enabledSteps[id]) {
      return id
    }
    // Don't show a hash for the default stepId
    clearHash()
    return defaultStepId
  }

  setStepIdFromHash(hash: string) {
    this.stepId = this.getStepIdFromHash(hash)
  }

  /**
   * Ensure all steps up until the given stepId are valid.
   *
   * @param id stepId to navigate to.
   * @returns whether or not it's possible to navigate to the given stepId.
   */
  #isStepEnabled(id: StepId) {
    for (let i = 0; i < orderedSteps.length; i++) {
      // When we find the given step id, we can be sure that all previous steps are valid.
      // If we have reached the desired step, we don't need to validate either this step or any later steps.
      // This way, we always enable the first step, and potentially also one more step that still needs to be completed.
      if (orderedSteps[i].id === id) {
        return true
      }

      // Abort as soon as we find a step that is not yet valid.
      // By returning false, we disable all the following steps.
      if (!this.#validatedSteps[i]) return false
    }

    throw new Error(`Failed step validation for stepId ${id}`)
  }

  canNavigateToStep(id: StepId) {
    return this.#enabledSteps[id]
  }

  #selectPickupOccasion(id: PickupOccasion['id']) {
    this.#order.current.items = {}
    this.#order.current.pickupOccasionId = id
  }

  selectPickupOccasion(id: PickupOccasion['id']) {
    if (this.#order.current.pickupOccasionId === id) return

    if (this.hasSelectedProducts()) {
      this.#confirmDialog = {
        ...getConfirmDialogTexts(
          this.pickupOccasions.find((p) => p.id === id)!,
        ),
        onResult: (confirmed) => {
          if (confirmed) {
            this.#selectPickupOccasion(id)
          }
          this.#confirmDialog = null
        },
      }
    } else {
      this.#selectPickupOccasion(id)
    }
  }

  hasSelectedProducts() {
    return Object.values(this.#order.current.items).some((count) => count > 0)
  }

  getProductCount(id: Product['id']) {
    return this.#order.current.items[id] ?? 0
  }

  setProductCount(id: Product['id'], count: number) {
    this.#order.current.items[id] = count
  }

  addProduct(id: Product['id'], count: number) {
    this.#order.current.items[id] = (this.#order.current.items[id] ?? 0) + count
  }

  /**
   * Let the user confirm before adding a product if it's connected to another pickup occasion.
   * Useful to prevent data loss.
   */
  addProductAfterConfirmation(id: Product['id'], count: number) {
    const pickupId = this.pickupOccasions.find((pickup) =>
      pickup.products.some((product) => product.id === id),
    )?.id

    if (!pickupId) throw new Error('Invalid product ID: ' + id)

    if (this.pickupOccasion?.id === pickupId) {
      this.addProduct(id, count)
      return
    }

    if (this.hasSelectedProducts()) {
      this.#confirmDialog = {
        ...getConfirmDialogTexts(
          this.pickupOccasions.find((p) => p.id === pickupId)!,
        ),
        onResult: (confirmed) => {
          if (confirmed) {
            this.#selectPickupOccasion(pickupId)
            this.addProduct(id, count)
          }
          this.#confirmDialog = null
        },
      }
      return
    }

    this.#selectPickupOccasion(pickupId)
    this.addProduct(id, count)
  }

  removeProduct(id: Product['id'], count: number) {
    const newCount = (this.#order.current.items[id] ?? 0) - count

    if (newCount > 0) {
      this.#order.current.items[id] = newCount
    } else {
      this.#order.current.items[id] = 0
    }
  }
}
