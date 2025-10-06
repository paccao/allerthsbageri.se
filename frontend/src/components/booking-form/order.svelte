<script lang="ts">
  import * as Card from '$components/ui/card'
  import { bookingContext } from './context'
  import { toSEKString } from '$lib/currency'
  import type { Product } from './booking-form.svelte'
  import ProductCount from './product-count.svelte'
  import { buttonVariants } from '$components/ui/button'
  import PhoneInput from '$components/phone-input.svelte'
  import Label from '$components/ui/label/label.svelte'
  import Input, { inputClasses } from '$components/ui/input/input.svelte'

  const ctx = bookingContext.get()
  const id = $props.id()

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

<div
  class="flex gap-8 max-w-(--breakpoint-lg) w-full mx-auto md:flex-row flex-col justify-center"
>
  <div
    class="grid w-full gap-4 md:pb-0 pb-8 max-w-xs self-center md:self-start"
  >
    <div class="grid gap-2">
      <Label for="name">Namn</Label>
      <Input id="name" type="text" required bind:value={ctx.customer.name} />
    </div>
    <div class="grid gap-2">
      <Label for="email">Email</Label>
      <Input id="email" type="email" required bind:value={ctx.customer.email} />
    </div>
    <div class="grid gap-2">
      <Label for="phone">Telefonnummer</Label>
      <PhoneInput
        defaultValue={ctx.customer.phone}
        onChange={(newNumber) => (ctx.customer.phone = newNumber)}
        bind:validationError={phoneError}
        class={inputClasses}
        containerClasses="**:outline-none [&_button]:!rounded-md transition-[color,box-shadow] ring-offset-background border-input **:focus-visible:border-ring **:focus-visible:ring-ring/50 **:focus-visible:ring-[3px]"
      />
      {#if phoneError}
        <span>{phoneError}</span>
      {/if}
    </div>
  </div>

  <div class="grow max-w-md self-center w-full">
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
      <div class="px-6 pt-8 text-black/85">
        <p>Betalning sker med Swish eller kontant på plats.</p>
        <!-- TODO: Add checkbox for accepting terms of service and privacy policy -->
        <!-- TODO: Add ToS and privacy policy pages -->
      </div>
    {/if}
  </div>
</div>
