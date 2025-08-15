<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Card from '$components/ui/card'
  import { toSEKString } from '$lib/currency'
  import { bookingContext } from './context'

  import LucideMinus from 'virtual:icons/lucide/minus'
  import LucidePlus from 'virtual:icons/lucide/plus'

  const ctx = bookingContext.get()
</script>

{#if ctx.pickupOccasion}
  <div class="grid gap-4 grid-cols-[repeat(auto-fit,minmax(256px,1fr))]">
    {#each [ctx.pickupOccasion.products, ctx.pickupOccasion.products].flat() as { id, name, description, price }}
      <Card.Root class="gap-4">
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
            <div
              class="flex justify-between w-full items-center gap-2 text-center"
            >
              <Button
                size="icon"
                class="size-12"
                onclick={() => ctx.removeProduct(id, 1)}
                ><LucideMinus class="size-5" /></Button
              >
              <!-- TODO: Show a number input in the middle and bind the value by using getters and setters -->
              <span class="grow">{ctx.getProductCount(id)}</span>
              <Button
                size="icon"
                class="size-12"
                onclick={() => ctx.addProduct(id, 1)}
                ><LucidePlus class="size-5" /></Button
              >
            </div>
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
