<script lang="ts">
  import * as Card from '$components/ui/card'
  import {
    type Order,
    type PickupOccasion,
    type StepId,
  } from './booking-form.svelte'
  import LucideChevronRight from 'virtual:icons/lucide/chevron-right'

  type Props = {
    order: Order
    nextStepId: StepId
    pickupOccasions: PickupOccasion[]
  }
  let { order, nextStepId, pickupOccasions }: Props = $props()

  const dateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  function selectPickupOccasion(pickup: PickupOccasion) {
    location.href = `#${nextStepId}`
    order.pickupOccasionId = pickup.id
  }
</script>

<div class="grid gap-4">
  {#each pickupOccasions as pickup}
    {@const dateTime = dateTimeFormatter.formatRange(
      pickup.startTime,
      pickup.endTime,
    )}
    <button
      onclick={() => selectPickupOccasion(pickup)}
      aria-label="Välj upphämtningstillfälle {dateTime}"
      class="group cursor-pointer"
    >
      <Card.Root
        class={[
          'relative hover:border-primary hover:bg-black/5 group-focus-within:border-primary group-focus-within:bg-black/5',
          order.pickupOccasionId === pickup.id && 'border-primary bg-black/5',
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
          class="absolute right-8 top-1/2 -translate-y-1/2 flex gap-2 items-center font-semibold group-hover:underline underline-offset-2"
        >
          Välj
          <LucideChevronRight class="size-6" />
        </span>
      </Card.Root>
    </button>
  {/each}
</div>
