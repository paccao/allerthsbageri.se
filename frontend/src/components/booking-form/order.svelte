<script lang="ts">
  import * as Card from '$components/ui/card'
  import { bookingContext } from './context'

  const ctx = bookingContext.get()
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
    <Card.Content class="grow">
      <!-- TODO: Product item name -->
      <!-- Show the count for each product -->
      <!-- TODO: Show the buttons to add/remove products -->
      <!-- TODO: If a product is completely removed from the order, remove it from the list -->
      <!-- TODO: Show the total price -->
      <!-- {#each ctx.order.items as item}
        {item}
      {/each} -->
    </Card.Content>
  </Card.Root>
</div>
