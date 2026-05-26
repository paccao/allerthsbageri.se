<script lang="ts">
  import * as Drawer from '$components/ui/drawer/index.js'
  import { Button } from '$components/ui/button/index.js'
  import { IsMobile } from '$lib/hooks/is-mobile.svelte.js'
  import { Label } from '$components/ui/label/index.js'
  import { Input } from '$components/ui/input/index.js'
  import * as Select from '$components/ui/select/index.js'
  import { Separator } from '$components/ui/separator/index.js'
  import DateTimePicker from './date-time-picker.svelte'
  import type { PickupOccasion } from './schemas.js'
  import { updatePickupOccasion } from '$lib/data/pickup-occasion.remote.js'
  import { parseDate, parseZonedDateTime } from '@internationalized/date'

  const isMobile = new IsMobile()

  let { item }: { item: PickupOccasion } = $props()
</script>

<Drawer.Root direction={isMobile.current ? 'bottom' : 'right'}>
  <Drawer.Trigger>
    {#snippet child({ props })}
      <Button
        variant="link"
        class="w-fit px-0 text-start text-foreground"
        {...props}
      >
        {item.name}
      </Button>
    {/snippet}
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header class="gap-1">
      <Drawer.Title>{item.name}</Drawer.Title>
      <Drawer.Description
        >Visar informationen om detta upphämtningstillfälle. Här kan du <span
          class="font-bold">redigera</span
        >
        fälten för att uppdatera informationen.</Drawer.Description
      >
    </Drawer.Header>
    <div class="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
      <form class="flex flex-col gap-4">
        <div class="flex flex-col gap-3">
          <Label for="name">Namn</Label>
          <Input id="name" value={item.name} />
          <Label for="location">Plats</Label>
          <Input id="location" value={item.location} />
          <Label for="orderStart">Beställning öppnar</Label>
          <DateTimePicker value={item.orderStart} />
          <Label for="orderEnd">Beställning stänger</Label>
          <DateTimePicker value={item.orderEnd} />
          <Label for="pickupStart">Upphämtning Start</Label>
          <DateTimePicker value={item.pickupStart} />
          <Label for="pickupEnd">Upphämtning End</Label>
          <DateTimePicker value={item.pickupEnd} />
        </div>
      </form>
    </div>
    <Drawer.Footer>
      <Button
        onclick={() => {
          console.log({
            id: item.id,
            name: item.name,
            location: item.location,
            orderStart: parseDate(item.orderStart.toString()).toString(),
            orderEnd: parseDate(item.orderEnd.toString()).toString(),
            pickupStart: parseDate(item.pickupStart.toString()).toString(),
            pickupEnd: parseDate(item.pickupEnd.toString()).toString(),
          })

          updatePickupOccasion({
            id: item.id,
            name: item.name,
            location: item.location,
            orderStart: parseDate(item.orderStart.toString()).toString(),
            orderEnd: parseDate(item.orderEnd.toString()).toString(),
            pickupStart: parseDate(item.pickupStart.toString()).toString(),
            pickupEnd: parseDate(item.pickupEnd.toString()).toString(),
          })
        }}>Bekräfta</Button
      >
      <Drawer.Close>
        {#snippet child({ props })}
          <Button variant="outline" {...props}>Avbryt</Button>
        {/snippet}
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
