<script lang="ts">
  import * as Card from '$components/ui/card'
  import { getBookingContext } from './context'
  import { toSEKString } from '$lib/currency'
  import type { Product } from './booking-form.svelte'
  import ProductCount from './product-count.svelte'
  import { buttonVariants } from '$components/ui/button'
  import PhoneInput from '$components/phone-input.svelte'
  import Label from '$components/ui/label/label.svelte'
  import Input, { inputClasses } from '$components/ui/input/input.svelte'

  const ctx = getBookingContext()

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

  const totalCount = $derived(
    orderItems.reduce((total, { count }) => total + count, 0),
  )

  const dateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const pickup = $derived(ctx.pickupOccasion!)
  const dateTime = $derived(
    dateTimeFormatter.formatRange(pickup.startTime, pickup.endTime),
  )
</script>

<div
  class="mx-auto flex w-full max-w-(--breakpoint-lg) flex-col justify-center gap-8 md:flex-row md:px-4"
>
  <div
    class="grid w-full max-w-xs gap-4 self-center px-4 pb-8 md:self-start md:px-0 md:pb-0"
  >
    <!--
    TODO: Add proper validation for customer data
    TODO: Show validation errors after submitting the form
    TODO: Show validation errors after the first blur event occured, and then after every change
    -->
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
        id="phone"
        defaultValue={ctx.customer.phone}
        onChange={(newNumber) => (ctx.customer.phone = newNumber)}
        class={inputClasses}
        containerClasses="**:outline-none [&_input]:h-10 [&_button]:!rounded-md transition-[color,box-shadow] ring-offset-background border-input **:focus-visible:border-ring **:focus-visible:ring-ring/50 **:focus-visible:ring-[3px]"
      />
    </div>
  </div>

  <div class="w-full max-w-md grow self-center px-0 2xs:px-4">
    <Card.Root class="h-min gap-4 pb-0">
      <Card.Header class="gap-4">
        <Card.Title class="text-lg font-bold">Varukorg</Card.Title>

        <p
          class="grid grid-cols-[max-content_1fr] rounded-md bg-accent p-2 text-sm shadow-sm"
        >
          <span class="font-bold">Upphämtning:</span>
          <span class="text-right">{dateTime}</span>
          <span class="font-bold">Plats:</span>
          <span class="text-right">{pickup.location}</span>
        </p>
      </Card.Header>

      {#if ctx.pickupOccasion}
        <Card.Content>
          {#if orderItems.length}
            <ul class="grid gap-4 font-bold">
              {#each orderItems as { id, name, count, price } (id)}
                {@const productTotalPrice = toSEKString(BigInt(count) * price)}
                <li
                  class="grid items-center gap-4 pb-4 not-last:border-b xs:grid-cols-[1fr_max-content] xs:gap-0"
                >
                  <h2 class="text-sm font-bold lg:text-base">{name}</h2>
                  <div
                    class="grid w-full grid-cols-[1fr_max-content] items-end xs:col-span-full xs:max-w-32 xs:grid-cols-1 xs:justify-self-end"
                  >
                    <span
                      class="hidden justify-self-end pr-1 pb-1 text-sm xs:flex"
                      >{productTotalPrice}</span
                    >
                    <ProductCount productId={id} size="md" class="max-w-32" />
                    <span class="text-sm xs:hidden">{productTotalPrice}</span>
                  </div>
                </li>
              {/each}
            </ul>
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
        <Card.Footer
          as="output"
          class={orderItems.length
            ? 'justify-between bg-accent py-4 font-bold'
            : 'pb-6'}
        >
          {#if orderItems.length}
            <span
              >{totalCount}
              {`var${totalCount < 2 ? 'a' : 'or'}`}</span
            >
            <span>{toSEKString(totalPrice)}</span>
          {/if}
        </Card.Footer>
      {/if}
    </Card.Root>

    {#if orderItems.length}
      <div class="px-6 pt-8 text-black/85">
        <p>Betalning sker på plats med Swish eller kontant.</p>
        <!-- TODO: Add checkbox for accepting terms of service and privacy policy -->
        <!-- TODO: Add ToS and privacy policy pages -->
      </div>
    {/if}
  </div>
</div>

<style>
  :global(.iti__search-input) {
    height: 40px;
  }
</style>
