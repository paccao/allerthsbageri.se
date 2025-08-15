<script lang="ts">
  import { toSEKString } from '$lib/currency'
  import { bookingContext } from './context'
  const ctx = bookingContext.get()
</script>

<!-- Grid with up to 4 columns on desktop and down to 1 on mobile -->
<!-- Each product can be selected with a + button that then transforms into a button row with an number input in the middle -->

{#if ctx.pickupOccasion}
  <div class="grid gap-4">
    {#each ctx.pickupOccasion.products as { name, description, price }}
      <!-- TODO: Use card component here -->
      <div class="p-4">
        <h2 class="font-bold">{name}</h2>
        <p>{description}</p>
        <p class="font-semibold">
          {toSEKString(price)}
        </p>
      </div>
    {/each}
  </div>
{/if}
