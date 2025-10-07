<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Card from '$components/ui/card'
  import { toSEKString } from '$lib/currency'
  import { bookingContext } from './context'
  import ProductCount from './product-count.svelte'

  const ctx = bookingContext.get()
</script>

<!--
TODO: Show clearly separated sections for each pickup occasion, with thier products listed in each section.
IDEA: Maybe implement as an accordion where selecting products from one pickup occasion disables the other sections.
IDEA: Show selection check mark for the selected pickup occasion.

To disable the other pickup occasions:
1) IDEA: Show overlay on hover or pointerdown over the section and describe that you.
2) IDEA: Only show overlay when pressing the ProductCount buttons.
   This is probably the best because it lets customers stay focused, and given them additional
   information only when they need it.
3) IDEA: Collapse the other sections to just show them as dates.

This would allow us to use one less step in the booking process. Just select your products, confirm your details and you're done.
By showing products earlier, it will be more inviting to complete orders.
-->
<!-- IDEA: Alternatively, show the pickup occasion on the products page. Maybe thin banner at the top -->
<!-- TODO: Only show the two upcoming pickup occasions -->

{#if ctx.pickupOccasion}
  <div
    class={[
      'grid gap-4 sm:grid-cols-2 mx-auto pb-4 px-4',
      ctx.pickupOccasion.products.length > 2 && 'lg:grid-cols-3',
      ctx.pickupOccasion.products.length > 3 && 'xl:grid-cols-4',
    ]}
  >
    <!-- TODO: Show product details like ingredients -->
    {#each ctx.pickupOccasion.products as { id, name, description, price }}
      <Card.Root class="gap-4 max-w-sm sm:max-w-xs w-full">
        <Card.Header>
          <Card.Title class="font-bold text-lg">{name}</Card.Title>
        </Card.Header>
        <Card.Content class="grow grid grid-rows-[1fr_min-content] gap-2">
          <Card.Description class="text-black/85"
            >{description}</Card.Description
          >
          <p class="font-black">
            {toSEKString(price)}
          </p>
        </Card.Content>
        <Card.Footer>
          {#if ctx.getProductCount(id) > 0}
            <ProductCount productId={id} size="lg" />
          {:else}
            <Button
              class="w-full self-end"
              size="xl"
              onclick={() => ctx.addProduct(id, 1)}>Lägg i varukorg</Button
            >
          {/if}
        </Card.Footer>
      </Card.Root>
    {/each}
  </div>
{/if}
