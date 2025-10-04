<script lang="ts">
  import * as Card from '$components/ui/card'
  import { bookingContext } from './context'
  import { toSEKString } from '$lib/currency'
  import type { Product } from './booking-form.svelte'
  import ProductCount from './product-count.svelte'
  import { buttonVariants } from '$components/ui/button'

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
      <Card.Title class="font-bold text-lg h-full">Varukorg</Card.Title>
    </Card.Header>

    {#if ctx.pickupOccasion}
      {#if orderItems.length}
        <Card.Content>
          <div class="grid gap-1 font-bold">
            {#each orderItems as { id, name } (id)}
              <div class="flex justify-between items-center gap-x-2">
                <h2 class="font-bold">{name}</h2>
                <ProductCount productId={id} size="md" class="max-w-32" />
              </div>
            {/each}
          </div>

          <hr class="my-4" />

          <p class="font-bold flex justify-between">
            <span>Att betala</span>
            <span>{toSEKString(totalPrice)}</span>
          </p>
        </Card.Content>

        <!-- TODO: Show details about payment conditions -->
        <!-- TODO: Add checkbox for accepting terms of service and privacy policy -->
        <!-- TODO: Add ToS and privacy policy pages -->
      {:else}
        <Card.Content>
          <div class="grid place-content-center text-center">
            <p>Här var det tomt.</p>
            <p class="pb-6">Dags att lägga till lite varor!</p>

            <a
              class={buttonVariants({ size: 'lg' })}
              href={`#${ctx.prevStepId}`}>Välj produkter</a
            >
          </div>
        </Card.Content>
      {/if}
    {/if}
  </Card.Root>
</div>
