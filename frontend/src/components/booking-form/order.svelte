<script lang="ts">
  import * as Card from '$components/ui/card'
  import { bookingContext } from './context'
  import { toSEKString } from '$lib/currency'
  import type { Product } from './booking-form.svelte'
  import ProductCount from './product-count.svelte'
  import { buttonVariants } from '$components/ui/button'
  import PhoneInput from '$components/phone-input.svelte'

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

  let phoneError: string | undefined = $state()
</script>

<div class="grid gap-x-4 gap-y-8 sm:grid-cols-2">
  <div class="grid p-4 place-content-start gap-4">
    <label class="grid">
      Namn
      <input
        type="text"
        placeholder="Namn"
        class="h-10 p-2 border"
        required
        bind:value={ctx.customer.name}
      />
    </label>
    <label class="grid">
      Email
      <input
        type="email"
        placeholder="Email"
        class="h-10 p-2 border"
        required
        bind:value={ctx.customer.email}
      />
    </label>
    <label class="grid">
      Telefonnummer
      <PhoneInput
        value={ctx.customer.phone}
        onChange={(newNumber) => (ctx.customer.phone = newNumber)}
        bind:validationError={phoneError}
        class="h-10 border w-full"
      />
      {#if phoneError}
        <span>{phoneError}</span>
      {/if}
    </label>
  </div>

  <Card.Root class="gap-4 h-min">
    <Card.Header>
      <Card.Title class="font-bold text-lg h-full">Varukorg</Card.Title>
    </Card.Header>

    {#if ctx.pickupOccasion}
      <Card.Content>
        {#if orderItems.length}
          <div class="grid gap-1 font-bold">
            {#each orderItems as { id, name } (id)}
              <div class="flex justify-between items-center gap-x-2">
                <h2 class="font-bold text-sm md:text-base">{name}</h2>
                <ProductCount productId={id} size="md" class="max-w-32" />
              </div>
            {/each}
          </div>

          <hr class="my-4" />

          <p class="font-bold flex justify-between">
            <span>Att betala</span>
            <span>{toSEKString(totalPrice)}</span>
          </p>
        {:else}
          <div class="grid place-content-center text-center">
            <p>Här var det tomt.</p>
            <p class="pb-6">Dags att lägga till lite varor!</p>

            <a
              class={buttonVariants({ size: 'lg' })}
              href={`#${ctx.prevStepId}`}>Välj produkter</a
            >
          </div>
        {/if}
      </Card.Content>
    {/if}
  </Card.Root>

  {#if orderItems.length}
    <div class="sm:col-start-2 px-6 text-black/85">
      <p>Betalning sker med Swish eller kontant på plats.</p>
      <!-- TODO: Add checkbox for accepting terms of service and privacy policy -->
      <!-- TODO: Add ToS and privacy policy pages -->
    </div>
  {/if}
</div>
