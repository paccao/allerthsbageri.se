<script lang="ts">
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

  const steps = ['1-pickup', '2-order', '3-customer', '4-confirmation'] as const
  type Step = (typeof steps)[number]
  let step = $state<Step>('1-pickup')

  // $effect(() => {
  //   const hash = new SvelteURL(window.location.href).hash.slice(1)
  //   if (steps.includes(hash as Step)) {
  //     step = hash as Step
  //   }
  // })

  let prevStep = $derived(steps[steps.indexOf(step) - 1] ?? null)
  let nextStep = $derived(steps[steps.indexOf(step) + 1] ?? null)

  // IDEA: Once we have persisted order form state, set the initial step based on
  // TODO: Remove persisted form state once the order has been submitted. This way, the next order will start fresh.
</script>

<svelte:window
  onhashchange={() => {
    const hash = new URL(window.location.href).hash.slice(1)
    if (steps.includes(hash as Step)) {
      step = hash as Step
    }
  }}
/>

<!-- TODO: Wrapper layout for the entire process, showing the steps -->
<!-- TODO: Use navigaton from lifewheel -->

<!-- TODO: Step 1: show pickup occasions -->
<!-- TODO: Step 2: show product grid with option to show product details -->
<!-- TODO: Step 3: show customer form -->
<!-- TODO: Step 4: show order confirmation -->

<div class="max-w-7xl mx-auto w-full">
  <!-- fixed header -->
  <!-- scrollable area in the middle -->
  <!-- bottom nav fixed on the screen -->

  <footer
    class="flex justify-center fixed bottom-0 w-full bg-amber-200 left-0 right-0"
  >
    <nav
      class="max-w-3xl flex gap-2 justify-between items-center bg-teal-200 w-full"
    >
      <!-- TODO: Ensure consistent width for all buttons, maybe use grid instead and center in the middle -->
      {#if prevStep}
        <!-- TODO: Ghost button with small chevron left -->
        <a href={`#${prevStep}`}>Tillbaka</a>
      {:else}
        <div></div>
      {/if}

      <!-- TODO: Make step dots clickable -->
      <!-- NOTE: Maybe hide step dots for smallest screens and show "1/N" instead -->

      <div class="flex items-center gap-1">
        {#each steps as current}
          <div
            class={[
              'rounded-full size-4 border',
              current === step && 'bg-border',
            ]}
          ></div>
        {/each}
      </div>

      {#if nextStep}
        <!-- TODO: Primary button with small chevron right -->
        <a href={`#${nextStep}`}>Gå vidare</a>
      {:else}
        <!-- TODO: Show succes button that navigates back to the home page -->
        <div></div>
      {/if}
    </nav>
  </footer>
</div>
