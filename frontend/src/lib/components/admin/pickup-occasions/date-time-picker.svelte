<script lang="ts">
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import type { ZonedDateTime, CalendarDate } from '@internationalized/date'
  import { Calendar } from '$components/ui/calendar'

  type Props = {
    value?: Date
  }

  // convert JS Date into ZonedDateTime and use it as the bindable value prop
  // read date into Calendar.value, and read
  // Add on:change={() => {}} handlers to the Calendar and Input to write back

  let { value = $bindable() }: Props = $props()
  const id = $props.id()
  let open = $state(false)

  $inspect(value)
</script>

<div class="flex gap-4">
  <div class="flex flex-col gap-3">
    <Label for="{id}-date" class="px-1">Datum</Label>
    <Popover.Root bind:open>
      <Popover.Trigger id="{id}-date">
        {#snippet child({ props })}
          <Button
            {...props}
            variant="outline"
            class="w-32 justify-between font-normal"
          >
            {value ? value.toDateString() : 'Välj datum'}
            <span class="i-[lucide--chevron-down] size-4"></span>
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content class="w-auto overflow-hidden p-0" align="start">
        <!-- value: DateValue -->
        <Calendar
          type="single"
          bind:value
          onValueChange={() => {
            open = false
          }}
          captionLayout="dropdown"
        />
      </Popover.Content>
    </Popover.Root>
  </div>
  <div class="flex flex-col gap-3">
    <Label for="{id}-time" class="px-1">Tid</Label>
    <!-- TODO: figure out what to use for value. Ideally bind to the value, but  -->
    <Input
      type="time"
      id="{id}-time"
      step="1"
      {value}
      class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
    />
  </div>
</div>
