<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Card from '$components/ui/card'
  import { toSEKString } from '$lib/currency'
  import { bookingContext } from './context'
  const ctx = bookingContext.get()
</script>

<!-- Each product can be selected with a + button that then transforms into a button row with an number input in the middle -->

{#if ctx.pickupOccasion}
  <div class="grid gap-4 grid-cols-[repeat(auto-fit,minmax(256px,1fr))]">
    {#each [ctx.pickupOccasion.products, ctx.pickupOccasion.products].flat() as { name, description, price }}
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
          <Button class="w-full self-end" size="xl">Lägg i varukorg</Button>
        </Card.Footer>
      </Card.Root>
    {/each}
  </div>
{/if}
