<script lang="ts">
  import * as Popover from '$lib/components/ui/popover/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import { Label } from '$lib/components/ui/label/index.js'
  import { Input } from '$lib/components/ui/input/index.js'
  import {
    parseDate,
    parseTime,
    parseAbsolute,
    ZonedDateTime,
    Time,
    parseAbsolute,
    getLocalTimeZone,
  } from '@internationalized/date'
  import { Calendar } from '$components/ui/calendar'
  import { isoDate } from '$lib/datetime'

  type Props = {
    /** Combined date and time. This one will be edited if the parent component binds to this value. */
    value?: ZonedDateTime
  }

  let { value = $bindable() }: Props = $props()

  /** Separate the date for display */
  let date = $derived(value ? value : undefined)
  /** Separate the time for display */
  let time = $derived(
    value ? new Time(value.hour, value.minute, value.second) : undefined,
  )

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
          value={date}
          onValueChange={(newValue) => {
            const timeZone = parseAbsolute(new Date().toISOString())
            value = newValue
              ? new ZonedDateTime(
                  newValue.year,
                  newValue.month,
                  newValue.day,
                  timeZone.timeZone,
                  timeZone.offset,
                  time?.hour,
                  time?.minute,
                  time?.second,
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
    <!-- TODO: fix bug when setting time to 23:00, it should not change to the next day. -->
    <!-- TODO: save UTC datetime internally, but display as local time in the input field -->
    <Input
      type="time"
      id="{id}-time"
      step="60"
      value={time}
      onchange={(event) => {
        const timeZone = parseAbsolute(new Date().toISOString())
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
          newTime?.second,
        )
      }}
      class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
    />
  </div>
</div>
