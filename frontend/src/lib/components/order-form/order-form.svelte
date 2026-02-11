<script lang="ts" module>
  import { OrderState } from './order-state.svelte'
</script>

<script lang="ts">
  import { setOrderContext } from './context'
  import OrderFooter from './order-footer.svelte'
  import Products from './products.svelte'
  import OrderSummary from './order-summary.svelte'
  import OrderConfirmation from './order-confirmation.svelte'

  // Workaround for https://github.com/sveltejs/svelte/issues/17015
  const ctx = setOrderContext(new OrderState())
  await ctx.init()

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
      <OrderConfirmation />
    {/if}
  </div>

  {#if !ctx.isLastStep}
    <OrderFooter />
  {/if}
</section>
