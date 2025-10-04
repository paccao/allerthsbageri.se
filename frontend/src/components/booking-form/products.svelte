<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Card from '$components/ui/card'
  import { toSEKString } from '$lib/currency'
  import { bookingContext } from './context'
  import ProductCount from './product-count.svelte'

  const ctx = bookingContext.get()
</script>

<!--
  TODO: Show the products listed directly on the same page as pickup occasions page.
  This would reduce the process by one step. Just select your products, confirm your details and you're done.
  By showing products earlier, it will be more inviting to complete orders.
-->
<!-- IDEA: Alternatively, show the pickup occasion on the products page. Maybe thin banner at the top -->

{#if ctx.pickupOccasion}
  <div
    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-auto pb-4"
  >
    <!-- TODO: Show product details like ingredients -->
    {#each ctx.pickupOccasion.products as { id, name, description, price }}
      <Card.Root class="gap-4 max-w-sm sm:max-w-xs w-full">
        <Card.Header>
          <Card.Title class="font-bold text-lg">{name}</Card.Title>
        </Card.Header>
        <Card.Content class="grow">
          <Card.Description class="text-black/85"
            >{description}</Card.Description
          >
          <p class="font-black pt-2">
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
