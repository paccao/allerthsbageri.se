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
      startTime: new Date('2025-08-23T10:00:00.000Z'),
      endTime: new Date('2025-08-23T15:30:00.000Z'),
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
      startTime: new Date('2025-08-23T10:00:00.000Z'),
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

  // convert steps to objects with title and id

  const steps = [
    {
      id: '1-pickup',
      title: 'Välj upphämtningstillfälle',
    },
    {
      id: '2-order',
      title: 'Beställ produkter',
    },
    {
      id: '3-customer',
      title: 'Dina kontaktuppgifter',
    },
    {
      id: '4-confirmation',
      title: 'Tack för din beställning!',
    },
  ] as const

  type StepId = (typeof steps)[number]['id']

  function getStepIdFromHash(hash: string) {
    return steps.find(({ id }) => id === (hash as StepId))?.id ?? steps[0].id
  }

  let stepId = $state<StepId>(
    getStepIdFromHash(new URL(window.location.href).hash.slice(1)),
  )

  let prevStepId = $derived(
    steps[steps.findIndex(({ id }) => id === stepId) - 1]?.id,
  )
  let nextStepId = $derived(
    steps[steps.findIndex(({ id }) => id === stepId) + 1]?.id,
  )

  // IDEA: Once we have persisted order form state, set the initial step based on
  // TODO: Remove persisted form state once the order has been submitted. This way, the next order will start fresh.
</script>

<svelte:window
  onhashchange={({ newURL }) => {
    stepId = getStepIdFromHash(new URL(newURL).hash.slice(1))
  }}
/>

<!-- TODO: Wrapper layout for the entire process, showing the steps -->
<!-- TODO: Use navigaton from lifewheel -->

<!-- TODO: Step 1: show pickup occasions -->
<!-- TODO: Step 2: show product grid with option to show product details -->
<!-- TODO: Step 3: show customer form -->
<!-- TODO: Step 4: show order confirmation -->

<div class="max-w-7xl mx-auto w-full">
  <!-- sticky header with title of the current step -->
  <!-- scrollable area in the middle -->

  <footer class="flex justify-center fixed bottom-0 w-full left-0 right-0">
    <nav
      class="max-w-md grid grid-cols-[1fr_max-content_1fr] gap-2 items-center p-4 bg-amber-200 w-full"
    >
      {#if prevStepId}
        <a
          href={`#${prevStepId}`}
          class={cn([
            'justify-self-start flex items-center gap-2',
            buttonVariants({ variant: 'ghost', size: 'lg' }),
          ])}><LucideChevronLeft class="size-4" /><span>Tillbaka</span></a
        >
      {:else}
        <div></div>
      {/if}

      <!-- TODO: Make step dots clickable -->
      <!-- NOTE: Maybe hide step dots for smallest screens and show "1/N" instead -->

      <div class="flex items-center gap-1">
        {#each steps as { id }}
          <div
            class={[
              'rounded-full size-4 border border-black',
              id === stepId && 'bg-black',
            ]}
          ></div>
        {/each}
      </div>

      {#if nextStepId}
        <a
          href={`#${nextStepId}`}
          class={cn([
            'justify-self-end flex items-center gap-2',
            buttonVariants({ variant: 'default', size: 'lg' }),
          ])}>Gå vidare<LucideChevronRight class="size-4" /></a
        >
      {:else}
        <!-- TODO: Show succes button that navigates back to the home page -->
        <div></div>
      {/if}
    </nav>
  </footer>
</div>
