<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Card from '$components/ui/card'
  import { toSEKString } from '$lib/currency'
  import { bookingContext } from './context'
  import ProductCount from './product-count.svelte'
  import { draw } from 'svelte/transition'
  import ConfirmDialog from './confirm-dialog.svelte'

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
  })

  const timeFormat = new Intl.DateTimeFormat('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const weekdayShort = new Intl.DateTimeFormat('sv-SE', { weekday: 'short' })
</script>

<!--
IDEA: Maybe add a short description at the top to give instructions on how to make a booking
This could be an expandable section with a help icon or similar. Expanded by default and dismissed after the first visit.
Basically a welcome message that explains how it works with as few words as possible.
-->

<!--
IDEA: Show a table of contents at the top with anchor links to every pickup occasion to clarify that multiple dates are available
Or rather than anchor links, clicking the links scrolls the page using JS since we use the URL hash for stepper navigation.
-->

<div class="grid gap-8 w-full">
  {#each ctx.pickupOccasions as pickup (pickup.id)}
    {@const isSelected = ctx.order.pickupOccasionId === pickup.id}
    {@const ariaLabel = `Välj upphämtningstillfälle ${dateTimeFormatter.formatRange(
      pickup.startTime,
      pickup.endTime,
    )}`}
    <div class="grid w-full">
      <div class="w-full sticky top-0 z-50 bg-background border-y">
        <label class="sr-only" for="pickup-{pickup.id}">{ariaLabel}</label>
        <button
          id="pickup-{pickup.id}"
          onclick={() => ctx.selectPickupOccasion(pickup.id)}
          aria-label={ariaLabel}
          class="group w-full cursor-pointer py-2 px-4 flex xs:justify-center justify-between items-center relative"
          aria-checked={isSelected}
          role="checkbox"
        >
          <div
            class="grid xs:grid-cols-[minmax(70px,max-content)_1fr] text-sm sm:text-base xs:border-r border-black xs:pr-6 sm:pr-8 xs:mr-6 sm:mr-8"
          >
            <span
              class="text-base xs:text-2xl font-bold xs:row-span-2 grid-cols-[max-content_max-content] xs:grid-cols-1 content-center grid place-items-center xs:pr-6 sm:pr-8 xs:border-r border-black xs:mr-6 sm:mr-8"
            >
              <span
                >{weekdayShort.format(pickup.startTime)}<span class="xs:hidden"
                  >&nbsp;</span
                ></span
              >
              <span>{shortDate.format(pickup.startTime).slice(0, -1)}</span>
            </span>
            <h2 class="flex items-center">
              <span class="i-[lucide--clock] size-4 mr-2"></span>
              <span class="pr-1">Upphämtning:</span>
              <span>
                {timeFormat.formatRange(pickup.startTime, pickup.endTime)}</span
              >
            </h2>
            <p class="flex items-center">
              <span class="i-[lucide--map-pin] size-4 mr-2"></span>
              <span>Plats: {pickup.location}</span>
            </p>
          </div>

          <div
            class={[
              'rounded-full size-8 p-2 shadow-xl flex border',
              isSelected ? 'bg-green' : 'bg-white text-muted-foreground',
            ]}
            aria-label={isSelected ? 'Vald' : ''}
          >
            {#key isSelected}
              <svg
                class={[
                  'w-full h-full',
                  isSelected
                    ? 'visible'
                    : 'invisible group-hover:visible group-focus-within:visible',
                ]}
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  in:draw={{ duration: 300 }}
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M 4,12 9,17 20,6"
                />
              </svg>
            {/key}
          </div>

          <div
            class="absolute top-full bg-gradient-to-t from-transparent to-black/5 h-8 w-full left-0 right-0 pointer-events-none"
          ></div>
        </button>
      </div>

      <div
        class="products-grid flex flex-wrap justify-center py-2 w-full max-w-(--breakpoint-2xl) mx-auto"
      >
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
                  onclick={() => ctx.addProductAfterConfirmation(id, 1)}
                  >Lägg i varukorg</Button
                >
              {/if}
            </Card.Footer>
          </Card.Root>
        {/each}
      </div>

      <div
        class="mt-8 mb-4 flex justify-center text-black/25 gap-4 items-center max-w-full"
        aria-hidden="true"
      >
        <span class="i-[game-icons--wheat] size-3"></span>
        <span class="i-[game-icons--wheat]"></span>
        <span class="i-[game-icons--wheat] size-3"></span>
      </div>
    </div>
  {/each}
</div>

<ConfirmDialog dialog={ctx.confirmDialog} />

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
