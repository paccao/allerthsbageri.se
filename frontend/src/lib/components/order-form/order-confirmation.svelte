<script lang="ts">
  import { cn } from 'tailwind-variants'

  import { buttonVariants } from '$components/ui/button'
  import { getOrderContext } from './context'
  import { dateTimeFormatter } from '$lib/datetime'

  const ctx = getOrderContext()
  const order = $derived(ctx.createdOrder!)
  const pickup = $derived(ctx.pickupOccasion!)
  const dateTime = $derived(
    dateTimeFormatter.formatRange(pickup.pickupStart, pickup.pickupEnd),
  )
</script>

<div class="grid justify-center px-4">
  <p class="text-lg">
    Hoppas det ska smaka! Vi bekräftar din order inom ett dygn.
  </p>

  <div
    class="rouded-md mt-8 space-y-2 rounded-md bg-accent p-2 text-sm shadow-sm xs:text-base"
  >
    <p class="grid grid-cols-[max-content_1fr]">
      <span class="font-bold">Upphämtning:</span>
      <span class="text-right">{dateTime}</span>
      <span class="font-bold">Plats:</span>
      <span class="text-right">{pickup.location}</span>
    </p>
  </div>

  <p
    class="mt-8 flex flex-wrap items-center gap-1 font-mono text-xs text-muted-foreground"
  >
    <span class="font-bold">ID:</span>
    <span class="whitespace-nowrap">{order.id}</span>
  </p>

  <a
    href="/"
    class={cn([
      'mt-8 flex items-center gap-2 place-self-center',
      buttonVariants({ variant: 'default', size: 'lg' }),
    ])}>Till startsidan</a
  >
</div>
