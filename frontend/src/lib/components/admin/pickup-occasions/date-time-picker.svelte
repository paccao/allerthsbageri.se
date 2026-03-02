<script lang="ts">
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import {
    parseDate,
    parseTime,
    parseAbsoluteToLocal,
    ZonedDateTime,
    Time,
  } from '@internationalized/date'
  import { Calendar } from '$components/ui/calendar'
  import { isoDate } from '$lib/datetime'

  type Props = {
    /** Combined date and time */
    value?: ZonedDateTime
  }

  let { value = $bindable() }: Props = $props()

  /** Separate the date to make it editable */
  let date = $derived(value ? value : undefined)
  /** Separate the time to make it editable */
  let time = $derived(value ? new Time(value.hour, value.minute) : undefined)

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
            {value ? isoDate.format(value.toDate()) : 'Välj datum'}
            <span class="i-[lucide--chevron-down] size-4"></span>
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content class="w-auto overflow-hidden p-0" align="start">
        <Calendar
          type="single"
          weekdayFormat="short"
          value={date}
          onValueChange={(newValue) => {
            const timeZone = parseAbsoluteToLocal(new Date().toISOString())
            value = newValue
              ? new ZonedDateTime(
                  newValue.year,
                  newValue.month,
                  newValue.day,
                  timeZone.timeZone,
                  timeZone.offset,
                  time?.hour,
                  time?.minute,
                )
              : value
            open = false
          }}
          captionLayout="dropdown"
        />
      </Popover.Content>
    </Popover.Root>
  </div>
  <div class="flex flex-col gap-3">
    <Label for="{id}-time" class="px-1">Tid</Label>
    <Input
      type="time"
      id="{id}-time"
      step="1"
      value={time}
      onchange={(event) => {
        const timeZone = parseAbsoluteToLocal(new Date().toISOString())
        const d = date ?? parseDate(new Date().toISOString())
        const newTime = parseTime(event.currentTarget.value)
        value = new ZonedDateTime(
          d.year,
          d.month,
          d.day,
          timeZone.timeZone,
          timeZone.offset,
          newTime.hour,
          newTime.minute,
        )
      }}
      class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
    />
  </div>
</div>
