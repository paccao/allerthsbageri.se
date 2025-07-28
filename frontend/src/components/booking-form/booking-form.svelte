<script lang="ts">
  import { buttonVariants } from '$components/ui/button'
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
      startTime: new Date('2025-08-23T07:00:00.000Z'),
      endTime: new Date('2025-08-23T15:30:00.000Z'),
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

  let order = $state({
    pickupOccasionId: null,
    items: [],
  })

  let customer = $state({
    name: '',
    email: '',
    phone: '',
  })

  const orderedSteps = [
    { id: 'pickup', title: 'Välj upphämtningstillfälle' },
    { id: 'order', title: 'Beställ produkter' },
    { id: 'customer', title: 'Dina kontaktuppgifter' },
    { id: 'confirmation', title: 'Tack för din beställning!' },
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

  let isLastStep = $derived(stepId === orderedSteps.at(-1)!.id)

  // IDEA: Once we have persisted order form state, load it to determine the intitial step
  // TODO: Remove persisted form state once the order has been submitted. This way, the next order will start fresh.
</script>

<svelte:window
  onhashchange={({ newURL }) => {
    stepId = getStepIdFromHash(new URL(newURL).hash.slice(1))
  }}
/>

<!-- TODO: Wrapper layout for the entire process, showing the steps -->

<!-- TODO: Step 1: show pickup occasions -->
<!-- TODO: Step 2: show product grid with option to show product details -->
<!-- TODO: Step 3: show customer form -->
<!-- TODO: Step 4: show order confirmation -->

<!-- TODO: Adjust padding to be around content rather than on the page container -->
<section class="max-w-7xl mx-auto w-full grid justify-items-center">
  <header class="p-4 sticky top-0 bg-background w-full">
    <h2 class="text-center text-balance font-semibold text-xl px-4">
      {step.title}
    </h2>
  </header>

  <div class="w-full grid gap-8 pb-18 px-4">
    <div class="h-screen bg-lime-100 w-full"></div>
    <div class="h-screen bg-lime-100 w-full"></div>
  </div>
  <!-- NOTE: Maybe linear gradient at both the top and bottom of the scrollable content. Absolute position, and relative container -->
  <!-- ideally only show linear gradient if there is scrollable content. Could use JS to check if the content is scrollable by comparing scrollHeight with element height or viewport height -->

  {#if isLastStep}
    <a
      href="/"
      class={cn([
        'flex items-center gap-2 mt-8',
        buttonVariants({ variant: 'default', size: 'lg' }),
      ])}>Till startsidan</a
    >
  {/if}

  <footer
    class="flex justify-center fixed bottom-0 w-full left-0 right-0 bg-background"
  >
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

          <!-- IDEA: Only allow navigating to previous or the latest step. E.g. only allow navigating to step 1 and 2 if 1 is valid, and 2 is not valid. later steps should not be available -->
          <nav class="items-center gap-1 xs:flex hidden">
            {#each orderedSteps.slice(0, -1) as { id, title }}
              <a
                class={[
                  id === stepId
                    ? 'bg-black'
                    : 'hover:bg-black/20 focus:bg-black/20',
                  'rounded-full size-4 border border-black ',
                ]}
                href={`#${id}`}
                aria-label="Gå till steg: {title}"
              ></a>
            {/each}
          </nav>
        {/if}
      </div>

      {#if nextStepId}
        <!-- IDEA: Only allow navigating to the next step if all previous steps are valid -->
        <a
          href={`#${nextStepId}`}
          class={cn([
            'justify-self-end',
            buttonVariants({ variant: 'default', size: 'lg' }),
          ])}
          >{#if nextStepId === orderedSteps.at(-1)!.id}<span
              >Skicka beställning</span
            >{:else}<span>Gå vidare</span><LucideChevronRight
              class="size-4"
            />{/if}</a
        >
      {:else}
        <div></div>
      {/if}
    </nav>
  </footer>
</section>
