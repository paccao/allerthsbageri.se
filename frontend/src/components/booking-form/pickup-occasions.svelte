<script lang="ts">
  import LucideChevronRight from 'virtual:icons/lucide/chevron-right'
  import LucideCheck from '~icons/lucide/check'
  import * as Card from '$components/ui/card'
  import { bookingContext } from './context'

  let ctx = bookingContext.get()

  const dateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  /** Used to prevent visual glitch when navigating */
  let isNavigating = $state(false)
</script>

<div class="grid gap-4 max-w-xl mx-auto w-full" class:hidden={isNavigating}>
  {#each ctx.pickupOccasions as pickup}
    {@const dateTime = dateTimeFormatter.formatRange(
      pickup.startTime,
      pickup.endTime,
    )}
    {@const isSelected = ctx.order.pickupOccasionId === pickup.id}
    <button
      onclick={() => {
        isNavigating = true
        ctx.selectPickupOccasion(pickup)
        window.location.hash = `#${ctx.nextStepId}`
      }}
      aria-label="Välj upphämtningstillfälle {dateTime}"
      class="group cursor-pointer"
    >
      <Card.Root
        class={[
          'text-left sm:text-center relative hover:border-primary hover:bg-black/5 group-focus-within:border-primary group-focus-within:bg-black/5',
          isSelected && 'border-primary bg-black/5',
        ]}
      >
        <Card.Header>
          <Card.Title>{pickup.name}</Card.Title>
          <p>{pickup.description}</p>
        </Card.Header>
        <Card.Content>
          <span>{dateTime}</span>
        </Card.Content>

        <span
          class="absolute right-4 sm:right-8 text-sm sm:text-base top-1/2 -translate-y-1/2 flex gap-2 items-center font-semibold group-hover:underline underline-offset-2"
        >
          {#if isSelected}
            <LucideCheck
              class="size-7 sm:size-8 bg-black text-white rounded-full p-2 shadow-xl mr-4"
            />
          {:else}
            Välj
            <LucideChevronRight class="size-6" />
          {/if}
        </span>
      </Card.Root>
    </button>
  {/each}
</div>
