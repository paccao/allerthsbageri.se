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

  const isMobile = new IsMobile()

  let { item }: { item: PickupOccasion } = $props()

  // let name = $state(item.name)
  // let location = $state(item.location)
  // let orderStart = $state(item.orderStart)
  // let orderEnd = $state(item.orderEnd)
  // let pickupStart = $state(item.pickupStart)
  // let pickupEnd = $state(item.pickupEnd)
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
          <Label for="orderStart">Order Start/Avslut</Label>
          <DateTimePicker
            orderStart={item.orderStart}
            orderEnd={item.orderEnd}
          />
          <Label for="pickupStart">Upphämtning Start/Avslut</Label>
          <DateTimePicker
            pickupStart={item.pickupStart}
            pickupEnd={item.pickupEnd}
          />
        </div>
      </form>
    </div>
    <Drawer.Footer>
      <Button>Bekräfta</Button>
      <Drawer.Close>
        {#snippet child({ props })}
          <Button variant="outline" {...props}>Avbryt</Button>
        {/snippet}
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
