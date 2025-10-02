<script lang="ts">
  import * as Card from '$components/ui/card'
  import { bookingContext } from './context'
  import { toSEKString } from '$lib/currency'
  import type { Product } from './booking-form.svelte'

  const ctx = bookingContext.get()

  const orderItems = $derived(
    Object.entries(ctx.order.items).reduce<(Product & { count: number })[]>(
      (orderItems, [productId, count]) => {
        const id = Number(productId)
        if (ctx.order.items[id]) {
          orderItems.push({
            ...ctx.pickupOccasion!.products.find((p) => p.id === id)!,
            count,
          })
        }
        return orderItems
      },
      [],
    ),
  )

  const totalPrice = $derived(
    orderItems.reduce(
      (total, { price, count }) => total + price * BigInt(count),
      0n,
    ),
  )
</script>

<div class="grid gap-x-4 gap-y-8 sm:grid-cols-[3fr_2fr]">
  <div class="bg-teal-50 h-full grid gap-4 p-4">
    <input type="text" placeholder="Namn" />
    <input type="email" placeholder="Email" />
    <input type="tel" placeholder="Telefonnummer" />
  </div>
  <Card.Root class="gap-4">
    <Card.Header>
      <Card.Title class="font-bold text-lg">Varukorg</Card.Title>
    </Card.Header>

    {#if ctx.pickupOccasion && ctx.order}
      <Card.Content class="grow">
        <div class="grid gap-1 font-bold">
          {#each orderItems as { id, name, count } (id)}
            <div class="flex justify-between">
              <h2 class="font-bold">{name}</h2>
              <span>{count}</span>
            </div>
            <!-- TODO: Show the buttons to add/remove products -->
            <!-- TODO: If a product is completely removed from the order, remove it from the list. This should happen automatically when the state is updated -->
          {/each}
        </div>

        <hr class="my-4" />

        <p class="font-bold flex justify-between">
          <span>Att betala</span>
          <span>{toSEKString(totalPrice)}</span>
        </p>
      </Card.Content>
    {/if}
  </Card.Root>
</div>
