<script lang="ts" module>
  import { BookingState } from './booking.svelte'

  // NOTE: Maybe rename booking/bokning to order/beställning?
  const pickupOccasions = [
    {
      id: 1,
      name: 'REKO-ringen Borås',
      location: 'Bäckängsgymnasiet',
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
      name: 'REKO-ringen Ulricehamn',
      location: 'Nya torget väveriet',
      startTime: new Date('2025-08-24T07:00:00.000Z'),
      endTime: new Date('2025-08-24T15:30:00.000Z'),
      products: [
        {
          id: 3,
          stock: 50,
          price: 6900n,
          pickupOccasionId: 2,
          name: 'Ekologiskt Surdegsbröd',
          description:
            'Bakat med färskmalen ekologisk emmer som är ett kultursädesslag som började odlas för 8 000 år sedan och är en korsning mellan enkorn och vildgräs.',
        },
        {
          id: 4,
          stock: 25,
          price: 6500n,
          pickupOccasionId: 2,
          name: 'Ekologiskt Rågsurdegsbröd',
          description: 'Bakat med färskmalet ekologiskt fullkornsrågmjöl.',
        },
      ],
    },
  ]

  export type PickupOccasion = (typeof pickupOccasions)[number]
  export type Product = (typeof pickupOccasions)[number]['products'][number]
</script>

<script lang="ts">
  import { buttonVariants } from '$components/ui/button'
  import { cn } from '$lib/utils'
  import PickupOccasions from './pickup-occasions.svelte'
  import { bookingContext } from './context'
  import BookingFooter from './booking-footer.svelte'
  import Products from './products.svelte'
  import Order from './order.svelte'

  const ctx = bookingContext.set(new BookingState(pickupOccasions))

  // IDEA: Once we have persisted order form state, load it to determine the intitial step
  // TODO: Remove persisted form state once the order has been submitted. This way, the next order will start fresh.
  const url = new URL(window.location.href)
</script>

<!-- Allow navigating to a specific step by clicking anchor links. -->
<!-- Disabled on the last step after submitting the form to prevent navigating back again -->
<svelte:window
  onhashchange={ctx.isLastStep
    ? null
    : ({ newURL }) => {
        url.href = newURL
        ctx.setStepIdFromHash(url.hash)
      }}
/>

<!-- TODO: Step 3: show customer form -->
<!-- TODO: Step 3: confirm order before submitting. list products and make it possible to adjust amounts -->

<!-- TODO: Step 4: show order confirmation after sucessfully submitted order  -->
<!-- TODO: Step 4: describe payment methods: swish and cash  -->
<!-- TODO: Step 4: show date, time and location -->
<!-- TODO: Step 4: Maybe add notice about cancellation and/or changes -->
<!--
  TODO: Step 4: Thank you for your order! If you want to order from other pickup occasions as well, you can do that [here](link to start page).
  We could also show a list of other pickup occasions that you haven't ordered from in the current session.
-->

<section class="w-full grid justify-items-center">
  <header class="sticky top-0 w-full border-t">
    <div class="relative p-4 bg-background">
      <h2 class="text-center text-balance font-semibold text-xl px-4">
        {ctx.step.title}
      </h2>

      <div
        class="absolute top-full bg-gradient-to-t from-transparent to-black/5 h-8 w-full left-0 right-0 pointer-events-none"
      ></div>
    </div>
  </header>

  <div class="w-full grid gap-8 pb-26 pt-8 max-w-(--breakpoint-2xl) mx-auto">
    {#if ctx.stepId === 'tid'}
      <PickupOccasions />
    {:else if ctx.stepId === 'varor'}
      <Products />
    {:else if ctx.stepId === 'order'}
      <Order />
    {:else if ctx.isLastStep}
      <a
        href="/"
        class={cn([
          'flex items-center gap-2 mt-8 place-self-center',
          buttonVariants({ variant: 'default', size: 'lg' }),
        ])}>Till startsidan</a
      >
    {/if}
  </div>

  {#if !ctx.isLastStep}
    <BookingFooter />
  {/if}
</section>
