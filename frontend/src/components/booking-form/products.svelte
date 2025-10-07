<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Card from '$components/ui/card'
  import { toSEKString } from '$lib/currency'
  import { bookingContext } from './context'
  import ProductCount from './product-count.svelte'
  import LucideCalendarClock from '~icons/lucide/calendar-clock'
  import LucideCheck from '~icons/lucide/check'

  const ctx = bookingContext.get()

  const dateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
</script>

<!--
TODO: Show clearly separated sections for each pickup occasion, with thier products listed in each section.
IDEA: Maybe implement as an accordion where selecting products from one pickup occasion disables the other sections.
IDEA: Show selection check mark for the selected pickup occasion.

To disable the other pickup occasions:
1) IDEA: Show overlay on hover or pointerdown over the section and describe that you.
2) IDEA: Only show overlay when pressing the ProductCount buttons.
   This is probably the best because it lets customers stay focused, and given them additional
   information only when they need it.
3) IDEA: Collapse the other sections to just show them as dates.

This would allow us to use one less step in the booking process. Just select your products, confirm your details and you're done.
By showing products earlier, it will be more inviting to complete orders.
-->
<!-- IDEA: Alternatively, show the pickup occasion on the products page. Maybe thin banner at the top -->
<!-- TODO: Only show the two upcoming pickup occasions -->

{#each ctx.pickupOccasions as pickup (pickup.id)}
  {@const dateTime = dateTimeFormatter.formatRange(
    pickup.startTime,
    pickup.endTime,
  )}
  {@const isSelected = ctx.order.pickupOccasionId === pickup.id}
  <button
    onclick={() => ctx.selectPickupOccasion(pickup.id)}
    aria-label="Välj upphämtningstillfälle {dateTime}"
    class="group cursor-pointer max-w-(--breakpoint-lg) mx-auto w-full p-4"
  >
    <div
      class={[
        'p-4 flex justify-between items-center border border-black rounded-lg hover:border-primary hover:bg-black/5 group-focus-within:border-primary group-focus-within:bg-black/5',
        isSelected && 'border-primary bg-black/5',
      ]}
    >
      <div class="flex flex-col justify-between items-start">
        <h2 class="font-bold flex items-center gap-2">
          <LucideCalendarClock class="size-4 inline" />
          <span class="first-letter:capitalize">{dateTime}</span>
        </h2>
        <p>{pickup.location}</p>
      </div>

      {#if isSelected}
        <LucideCheck
          class="size-7 sm:size-8 bg-black text-white rounded-full p-2 shadow-xl"
        />
      {/if}
    </div>
  </button>

  <div class="products-grid flex flex-wrap justify-center">
    <!-- IDEA: Allow opening a modal to see product details like ingredients -->
    {#each pickup.products as { id, name, description, price } (id)}
      <Card.Root class="product">
        <Card.Header>
          <Card.Title class="font-bold text-lg">{name}</Card.Title>
        </Card.Header>
        <Card.Content class="grow grid grid-rows-[1fr_min-content] gap-2">
          <Card.Description class="text-black/85"
            >{description}</Card.Description
          >
          <p class="font-black">
            {toSEKString(price)}
          </p>
        </Card.Content>
        <Card.Footer>
          {#if ctx.getProductCount(id) > 0}
            <ProductCount productId={id} size="lg" />
          {:else}
            <Button
              class="w-full self-end"
              size="xl"
              onclick={() => ctx.addProduct(id, 1)}>Lägg i varukorg</Button
            >
          {/if}
        </Card.Footer>
      </Card.Root>
    {/each}
  </div>
{/each}

<style>
  .products-grid {
    --gap: 1rem;
    --max-cols: 3;
  }

  /* NOTE: Seems to be a bug with Svelte not recognising the .product class unless we put it in :global() */
  :global(.product) {
    flex: 0 0 calc(calc(100% / var(--max-cols)) - var(--gap));
    margin: calc(var(--gap) / 2);
    min-width: calc(100% - calc(var(--gap) * 2));
    max-width: 384px;
  }

  @media (width >= 475px) {
    :global(.product) {
      min-width: 384px !important;
    }
  }

  @media (width >= 640px) {
    :global(.product) {
      min-width: clamp(300px, 40%, 384px) !important;
    }
  }
</style>
