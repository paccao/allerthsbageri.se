<script lang="ts">
  import LucideChevronRight from 'virtual:icons/lucide/chevron-right'
  import LucideCheck from '~icons/lucide/check'
  import * as Card from '$components/ui/card'
  import { bookingContext } from './context'
  import { fade } from 'svelte/transition'

  let ctx = bookingContext.get()

  const dateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
</script>

<div class="grid gap-4 max-w-xl mx-auto w-full">
  {#each ctx.pickupOccasions as pickup}
    {@const dateTime = dateTimeFormatter.formatRange(
      pickup.startTime,
      pickup.endTime,
    )}
    {@const isSelected = ctx.order.pickupOccasionId === pickup.id}
    <button
      onclick={() => ctx.selectPickupOccasion(pickup)}
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
          transition:fade={{ duration: 300 }}
        >
          {#if isSelected}
            <!-- <span transition:fade={{ duration: 300 }}> -->
            <LucideCheck
              class="size-7 sm:size-8 bg-black text-white rounded-full p-2 shadow-xl mr-4"
            />
            <!-- </span> -->
          {:else}
            Välj
            <LucideChevronRight class="size-6" />
          {/if}
        </span>
      </Card.Root>
    </button>
  {/each}
</div>
