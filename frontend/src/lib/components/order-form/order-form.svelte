<script lang="ts" module>
  import { OrderState } from './order-state.svelte'

  export type PickupOccasion = Awaited<
    ReturnType<typeof getPickupOccasionsWithDetails>
  >[number]
  export type Product = PickupOccasion['products'][number]
</script>

<script lang="ts">
  import { buttonVariants } from '$components/ui/button'
  import { cn } from '$lib/utils'
  import { setOrderContext } from './context'
  import OrderFooter from './order-footer.svelte'
  import Products from './products.svelte'
  import OrderSummary from './order-summary.svelte'
  import { getPickupOccasionsWithDetails } from '$lib/data/pickup-occasion.remote'

  // Workaround for https://github.com/sveltejs/svelte/issues/17015
  const ctx = setOrderContext(new OrderState([]))
  ctx.pickupOccasions = await getPickupOccasionsWithDetails()

  // TODO: Remove persisted form state once the order has been submitted. This way, the next order will start fresh.
</script>

<!--
    This allows navigating to a specific step by clicking anchor links.
    The hash routing is disabled on the last step to prevent navigating back again after the order form has been submitted.
    NOTE: The edge case for the last step routing might not be needed if we redirect to another page (which could be the order confirmation page)
    IDEA: Maybe we could simplify the state management with the steps
-->
<svelte:window
  onhashchange={ctx.isLastStep
    ? null
    : ({ newURL }) => ctx.setStepIdFromHash(new URL(newURL).hash)}
/>

<!-- TODO: Step 2: show customer form -->
<!-- TODO: Step 2: confirm order before submitting. list products and make it possible to adjust amounts -->

<!-- TODO: Step 3: show order confirmation after sucessfully submitted order  -->
<!-- TODO: Step 3: describe payment methods: swish and cash  -->
<!-- TODO: Step 3: show date, time and location -->
<!-- TODO: Step 3: Maybe add notice about cancellation and/or changes -->
<!--
  TODO: Step 3: Thank you for your order! If you want to order from other pickup occasions as well, you can do that [here](link to start page).
  We could also show a button to go back to the start page and order from other pickup occasions.
-->

<section class="grid w-full justify-items-center">
  <header class="w-full border-t">
    <div class="relative bg-background p-4">
      <h2 class="px-4 text-center text-xl font-semibold text-balance">
        {ctx.step.title}
      </h2>

      <div
        class="pointer-events-none absolute top-full right-0 left-0 h-8 w-full bg-linear-to-t from-transparent to-black/5"
      ></div>
    </div>
  </header>

  <div class="w-full pt-8 pb-26">
    {#if ctx.stepId === 'varor'}
      <Products />
    {:else if ctx.stepId === 'order'}
      <OrderSummary />
    {:else if ctx.isLastStep}
      <a
        href="/"
        class={cn([
          'mt-8 flex items-center gap-2 place-self-center',
          buttonVariants({ variant: 'default', size: 'lg' }),
        ])}>Till startsidan</a
      >
    {/if}
  </div>

  {#if !ctx.isLastStep}
    <OrderFooter />
  {/if}
</section>
