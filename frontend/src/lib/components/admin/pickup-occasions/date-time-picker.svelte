<script lang="ts">
  import RangeCalendar from '$lib/components/admin/pickup-occasions/calendar/range-calendar.svelte'
  import * as Popover from '$lib/components/admin/pickup-occasions/popover/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  // import ChevronDownIcon from '@lucide/svelte/icons/chevron-down'
  import { getLocalTimeZone } from '@internationalized/date'
  import type { CalendarDate } from '@internationalized/date'

  type PickupProps = {
    pickupStart: Date
    pickupEnd: Date
    orderStart?: null
    orderEnd?: null
  }

  type OrderProps = {
    pickupStart?: null
    pickupEnd?: null
    orderStart: Date
    orderEnd: Date
  }

  const {
    pickupStart = null,
    pickupEnd = null,
    orderStart = null,
    orderEnd = null,
  }: PickupProps | OrderProps = $props()

  if (!pickupStart && !orderStart) {
    throw new Error(
      'At least one of pickupStart or orderStart must be provided.',
    )
  }

  const id = $props.id()
  let open = $state(false)
</script>

<div class="flex gap-4">
  <div class="flex flex-col gap-3">
    <Label for="{id}-date" class="px-1">Date</Label>
    <Popover.Root bind:open>
      <Popover.Trigger id="{id}-date">
        {#snippet child({ props })}
          <Button
            {...props}
            variant="outline"
            class="w-32 justify-between font-normal"
          >
            {value
              ? value.toDate(getLocalTimeZone()).toLocaleDateString()
              : 'Select date'}
            <!-- <ChevronDownIcon /> -->
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content class="w-auto overflow-hidden p-0" align="start">
        <RangeCalendar bind:value class="rounded-md border" />
      </Popover.Content>
    </Popover.Root>
  </div>
  <div class="flex flex-col gap-3">
    <Label for="{id}-time" class="px-1">Time</Label>
    <Input
      type="time"
      id="{id}-time"
      step="1"
      value="10:30:00"
      class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
    />
  </div>
</div>
