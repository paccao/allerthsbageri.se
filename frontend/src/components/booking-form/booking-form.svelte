<script lang="ts">
  import { buttonVariants } from '$components/ui/button'
  import * as Card from '$components/ui/card'
  import { cn } from '$lib/utils'
  import LucideChevronLeft from 'virtual:icons/lucide/chevron-left'
  import LucideChevronRight from 'virtual:icons/lucide/chevron-right'

  // TODO: state management for the booking process: pickup occasion, products and amounts, contact details
  // TODO: steps as separate snippets that get rendered by selecting the current step

  // NOTE: Maybe rename booking/bokning to order/beställning?
  const pickupOccasions = [
    {
      id: 1,
      location: 'REKO-ringen Borås',
      startTime: new Date('2025-08-23T08:00:00.000Z'),
      endTime: new Date('2025-08-23T13:30:00.000Z'),
      products: [
        {
          id: 1,
          stock: 50,
          price: 6900n,
          pickupOccasionId: 1,
          name: 'Ekologiskt Surdegsbröd',
          description:
            'Bakat med färskmalen ekologisk emmer som är ett kultursädesslag som började odlas för 8 000 år sedan och är en korsning mellan enkorn och vildgräs.',
        },
        {
          id: 2,
          stock: 25,
          price: 6500n,
          pickupOccasionId: 1,
          name: 'Ekologiskt Rågsurdegsbröd',
          description: 'Bakat med färskmalet ekologiskt fullkornsrågmjöl.',
        },
      ],
    },
    {
      id: 2,
      location: 'REKO-ringen Ulricehamn',
      startTime: new Date('2025-08-24T07:00:00.000Z'),
      endTime: new Date('2025-08-24T15:30:00.000Z'),
      products: [
        {
          id: 1,
          stock: 50,
          price: 6900n,
          pickupOccasionId: 2,
          name: 'Ekologiskt Surdegsbröd',
          description:
            'Bakat med färskmalen ekologisk emmer som är ett kultursädesslag som började odlas för 8 000 år sedan och är en korsning mellan enkorn och vildgräs.',
        },
        {
          id: 2,
          stock: 25,
          price: 6500n,
          pickupOccasionId: 2,
          name: 'Ekologiskt Rågsurdegsbröd',
          description: 'Bakat med färskmalet ekologiskt fullkornsrågmjöl.',
        },
      ],
    },
  ]

  type PickupOccasion = (typeof pickupOccasions)[number]
  type Product = (typeof pickupOccasions)[number]['products'][number]

  type Order = {
    pickupOccasionId: number | null
    items: []
  }
  let order = $state<Order>({
    pickupOccasionId: null,
    items: [],
  })

  let customer = $state({
    name: '',
    email: '',
    phone: '',
  })

  const orderedSteps = [
    { id: 'tid', title: 'Välj upphämtningstillfälle' },
    { id: 'varor', title: 'Beställ produkter' },
    { id: 'kund', title: 'Dina kontaktuppgifter' },
    { id: 'tack', title: 'Tack för din beställning!' },
  ] as const

  type StepId = (typeof orderedSteps)[number]['id']
  type Step = { id: StepId; title: string }
  const defaultStepId: StepId = orderedSteps[0].id

  const steps = orderedSteps.reduce(
    (acc, step) => {
      acc[step.id as StepId] = step
      return acc
    },
    {} as Record<StepId, Step>,
  )

  function getStepIdFromHash(hash: string) {
    return steps[hash as StepId]?.id ?? defaultStepId
  }

  let stepId = $state<StepId>(
    getStepIdFromHash(new URL(window.location.href).hash.slice(1)),
  )
  let step = $derived(steps[stepId])!

  let prevStepId = $derived(
    orderedSteps[orderedSteps.findIndex(({ id }) => id === stepId) - 1]?.id,
  )
  let nextStepId = $derived(
    orderedSteps[orderedSteps.findIndex(({ id }) => id === stepId) + 1]?.id,
  )

  const validators: Record<StepId, () => boolean> = {
    tid: () => Number.isInteger(order.pickupOccasionId),
    varor: () => order.items.length > 0,
    // TODO: Improve validation for customer data, maybe using a zod schema
    kund: () =>
      customer.name.trim().length > 0 &&
      customer.email.trim().length > 0 &&
      customer.phone.trim().length > 0,
    tack: () => true,
  }

  function canNavigateToStep(id: StepId) {
    switch (id) {
      case 'varor':
        return validators.tid()
      case 'kund':
        return validators.tid() && validators.varor()
      case 'tack':
        return validators.tid() && validators.varor() && validators.kund()
      default:
        return true
    }
  }

  let canNavigateToNextStep = $derived.by(() => canNavigateToStep(nextStepId))

  let isLastStep = $derived(stepId === orderedSteps.at(-1)!.id)

  function formatPickupDateTime({
    startTime,
    endTime,
  }: PickupOccasion): string {
    if (
      startTime.toLocaleDateString('sv-SE') ===
      endTime.toLocaleDateString('sv-SE')
    ) {
      // Standard case: Show Date followed by times
      return `${startTime.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', weekday: 'short' })} kl ${startTime.toLocaleTimeString('sv-SE', { timeStyle: 'short' })} - ${endTime.toLocaleTimeString('sv-SE', { timeStyle: 'short' })}`
    } else {
      // Special case: Show Date + time for both
      return `${startTime.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', weekday: 'short' })} kl ${startTime.toLocaleTimeString('sv-SE', { timeStyle: 'short' })} - ${endTime.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', weekday: 'short' })} kl ${endTime.toLocaleTimeString('sv-SE', { timeStyle: 'short' })}`
    }
  }

  // IDEA: Once we have persisted order form state, load it to determine the intitial step
  // TODO: Remove persisted form state once the order has been submitted. This way, the next order will start fresh.

  function selectPickupOccasion(pickup: PickupOccasion) {
    location.href = `#${nextStepId}`
    order.pickupOccasionId = pickup.id
  }
</script>

<!-- Prevent navigating back to earlier steps after order form has been submitted -->
<svelte:window
  onhashchange={isLastStep
    ? null
    : ({ newURL }) => {
        stepId = getStepIdFromHash(new URL(newURL).hash.slice(1))
      }}
/>

<!-- TODO: Step 1: show pickup occasions -->
<!-- TODO: Step 2: show product grid with option to show product details -->
<!-- TODO: Step 3: show customer form -->
<!-- TODO: Step 4: show order confirmation -->

<section class="max-w-7xl mx-auto w-full grid justify-items-center">
  <header class="sticky top-0 w-full border-t">
    <div class="relative p-4 bg-background">
      <h2 class="text-center text-balance font-semibold text-xl px-4">
        {step.title}
      </h2>

      <div
        class="absolute top-full bg-gradient-to-t from-transparent to-black/5 h-8 w-full left-0 right-0 pointer-events-none"
      ></div>
    </div>
  </header>

  <div class="w-full grid gap-8 pb-18 px-4 pt-4">
    {#if stepId === 'tid'}
      <div class="grid gap-4">
        {#each pickupOccasions as pickup}
          {@const dateTime = formatPickupDateTime(pickup)}
          <button
            onclick={() => selectPickupOccasion(pickup)}
            aria-label="Välj upphämtningstillfälle {dateTime}"
            class="group cursor-pointer"
          >
            <Card.Root
              class={[
                'relative hover:border-primary hover:bg-black/5 group-focus-within:border-primary group-focus-within:bg-black/5',
                order.pickupOccasionId === pickup.id &&
                  'border-primary bg-black/5',
              ]}
            >
              <Card.Header>
                <Card.Title>{pickup.location}</Card.Title>
              </Card.Header>
              <Card.Content>
                <span>{dateTime}</span>
              </Card.Content>

              <span
                class="absolute right-8 top-1/2 -translate-y-1/2 flex gap-2 items-center font-semibold group-hover:underline underline-offset-2"
              >
                Välj
                <LucideChevronRight class="size-6" />
              </span>
            </Card.Root>
          </button>
        {/each}
      </div>

      <!-- {:else if stepId === 'varor'}
    {:else if stepId === 'kund'} -->
    {:else if isLastStep}
      <a
        href="/"
        class={cn([
          'flex items-center gap-2 mt-8',
          buttonVariants({ variant: 'default', size: 'lg' }),
        ])}>Till startsidan</a
      >
    {/if}
  </div>

  <footer
    class="flex justify-center fixed bottom-0 w-full left-0 right-0 bg-background"
  >
    <div
      class="fixed bottom-18 z-20 bg-gradient-to-t from-black/5 to-transparent h-8 w-full left-0 right-0 pointer-events-none"
    ></div>

    <nav
      class="max-w-[var(--breakpoint-sm)] grid grid-cols-[1fr_max-content_1fr] gap-2 items-center p-4 w-full sm:p-8 sm:pt-4"
    >
      {#if prevStepId && !isLastStep}
        <a
          href={`#${prevStepId}`}
          class={cn([
            'justify-self-start',
            buttonVariants({ variant: 'ghost', size: 'lg' }),
          ])}><LucideChevronLeft class="size-4" /><span>Tillbaka</span></a
        >
      {:else}
        <div></div>
      {/if}

      <div>
        {#if !isLastStep}
          <span class="xs:hidden text-sm"
            >{orderedSteps.findIndex((step) => step.id === stepId) +
              1}/{orderedSteps.length - 1}</span
          >

          <nav class="items-center gap-1 xs:flex hidden">
            {#each orderedSteps.slice(0, -1) as { id, title }}
              {@const enabled = canNavigateToStep(id)}
              <a
                class={cn([
                  'rounded-full size-4 border border-black',
                  id === stepId
                    ? 'bg-black'
                    : 'hover:bg-black/20 focus:bg-black/20',
                  !enabled && 'opacity-50 pointer-events-none border-black/50',
                ])}
                href={enabled ? `#${id}` : 'javascript:void(0)'}
                aria-label="Gå till steg: {title}"
              ></a>
            {/each}
          </nav>
        {/if}
      </div>

      {#if nextStepId}
        <a
          href={canNavigateToNextStep ? `#${nextStepId}` : 'javascript:void(0)'}
          class={cn([
            'justify-self-end',
            buttonVariants({ variant: 'default', size: 'lg' }),
          ])}
          aria-disabled={!canNavigateToNextStep}
        >
          {#if nextStepId === orderedSteps.at(-1)!.id}
            <span>Skicka beställning</span>
          {:else}
            <span>Gå vidare</span><LucideChevronRight class="size-4" />
          {/if}
        </a>
      {:else}
        <div></div>
      {/if}
    </nav>
  </footer>
</section>
