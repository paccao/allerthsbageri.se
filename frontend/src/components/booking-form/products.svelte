<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Card from '$components/ui/card'
  import { toSEKString } from '$lib/currency'
  import { bookingContext } from './context'
  import ProductCount from './product-count.svelte'
  import LucideClock from '~icons/lucide/clock'
  import LucideCheck from '~icons/lucide/check'
  import LucideMapPin from '~icons/lucide/map-pin'

  const ctx = bookingContext.get()

  const dateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  const shortDate = new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  })

  const timeFormat = new Intl.DateTimeFormat('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  })
</script>

<!--
IDEA: Maybe implement as an accordion where selecting products from one pickup occasion disables the other sections.

To disable the other pickup occasions:
1) IDEA: Show overlay on hover or pointerdown over the section and describe that you.
2) IDEA: Only show overlay when pressing the ProductCount buttons.
   This is probably the best because it lets customers stay focused, and given them additional
   information only when they need it.
3) IDEA: Collapse the other sections to just show them as dates.

This would allow us to use one less step in the booking process. Just select your products, confirm your details and you're done.
By showing products earlier, it will be more inviting to complete orders.
-->

<!--
TODO: Only show the two upcoming pickup occasions.
This should be limited in the API to only return the two next pickupOccasions,
or those with startDate within the next two weeks
-->

<!--
IDEA: Maybe add a short description at the top to give instructions on how to make a booking
This could be an expandable section with a help icon or similar.
-->

{#each ctx.pickupOccasions as pickup (pickup.id)}
  {@const isSelected = ctx.order.pickupOccasionId === pickup.id}
  <!-- TODO: If product is for a different pickupOccasion, show a confirmation dialog before proceeding. -->
  <div class="max-w-(--breakpoint-lg) mx-auto w-full p-4">
    <button
      onclick={() => ctx.selectPickupOccasion(pickup.id)}
      aria-label="Välj upphämtningstillfälle {dateTimeFormatter.formatRange(
        pickup.startTime,
        pickup.endTime,
      )}"
      class={[
        'group w-full cursor-pointer p-4 flex justify-between items-center border rounded-lg bg-black/5',
        isSelected ? 'border-black' : 'hover:border-black/50',
      ]}
    >
      <div class="flex flex-col justify-between items-start">
        <div class="grid grid-cols-[max-content_1fr]">
          <span
            class="text-2xl font-bold row-span-2 grid place-items-center pr-4 border-r border-black mr-4"
            >{shortDate.format(pickup.startTime).slice(0, -1)}</span
          >
          <h2 class="flex items-center">
            <LucideClock class="size-4 inline mr-2" />
            <span class="pr-1">Upphämtning:</span>
            <span>
              {timeFormat.formatRange(pickup.startTime, pickup.endTime)}</span
            >
          </h2>
          <p class="flex items-center">
            <LucideMapPin class="size-4 inline mr-2" />
            <span>Plats: {pickup.location}</span>
          </p>
        </div>
      </div>

      <div
        class={[
          'rounded-full size-7 sm:size-8 p-2 shadow-xl',
          isSelected ? 'bg-green' : 'bg-white',
        ]}
      >
        <LucideCheck
          class={[
            'w-full h-full opacity-0',
            isSelected
              ? 'opacity-100'
              : 'group-hover:opacity-100 group-focus-within:opacity-100',
          ]}
        />
      </div>
    </button>
  </div>

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
              onclick={() => {
                // TODO: If product is for a different pickupOccasion, show a confirmation dialog before proceeding.
                if (ctx.pickupOccasion?.id !== pickup.id) {
                  ctx.selectPickupOccasion(pickup.id)
                }
                ctx.addProduct(id, 1)
              }}>Lägg i varukorg</Button
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
