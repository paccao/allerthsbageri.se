<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Card from '$components/ui/card'
  import { toSEKString } from '$lib/currency'
  import { bookingContext } from './context'
  import ProductCount from './product-count.svelte'
  import LucideClock from '~icons/lucide/clock'
  import LucideMapPin from '~icons/lucide/map-pin'
  import { draw } from 'svelte/transition'
  import GameIconsWheat from '~icons/game-icons/wheat'

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
    // weekday: 'short',
  })

  const timeFormat = new Intl.DateTimeFormat('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const weekdayShort = new Intl.DateTimeFormat('sv-SE', { weekday: 'short' })

  function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function addDays(date: Date, days: number) {
    var result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
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
This could be an expandable section with a help icon or similar. Expanded by default and dismissed after the first visit.
-->

<!-- IDEA: Show a table of contents at the top with anchor links to every pickup occasion to clarify that multiple dates are available -->

<!-- {#each ctx.pickupOccasions as pickup (pickup.id)} -->
{#each [ctx.pickupOccasions, ctx.pickupOccasions, ctx.pickupOccasions]
  .flat()
  .map( (x, i) => ({ ...x, id: randomInteger(1, 9999), startTime: addDays(x.startTime, i * 12), endTime: addDays(x.endTime, i * 12) }), ) as pickup}
  {@const isSelected = ctx.order.pickupOccasionId === pickup.id}
  <!-- TODO: If product is for a different pickupOccasion, show a confirmation dialog before proceeding. -->
  <div class="grid">
    <div
      class="w-screen md:px-4 sticky top-0 z-50 bg-background border-y sm:mx-[calc(50%-50vw)]"
    >
      <button
        onclick={() => ctx.selectPickupOccasion(pickup.id)}
        aria-label="Välj upphämtningstillfälle {dateTimeFormatter.formatRange(
          pickup.startTime,
          pickup.endTime,
        )}"
        class="group w-full cursor-pointer py-2 px-4 xs:p-4 flex xs:justify-center justify-between items-center md:rounded-lg relative"
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

        <div
          class={[
            'rounded-full size-8 p-2 shadow-xl flex border',
            isSelected ? 'bg-green' : 'bg-white text-muted-foreground',
          ]}
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
            >
              <path
                in:draw={{ duration: 200 }}
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
      </button>
    </div>

    <div class="products-grid flex flex-wrap justify-center py-2">
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

    <div
      class="mt-8 mb-4 flex justify-center text-black/25 gap-4 items-center max-w-full"
      aria-hidden="true"
    >
      <GameIconsWheat class="size-3" />
      <GameIconsWheat />
      <GameIconsWheat class="size-3" />
    </div>
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
