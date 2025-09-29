<script lang="ts">
  import { Button } from '$components/ui/button'
  import * as Card from '$components/ui/card'
  import { toSEKString } from '$lib/currency'
  import { bookingContext } from './context'

  import LucideMinus from 'virtual:icons/lucide/minus'
  import LucidePlus from 'virtual:icons/lucide/plus'

  const ctx = bookingContext.get()

  /** Keep references to all number inputs */
  const numberInputs: Record<number, HTMLInputElement> = {}
  let activeElement: HTMLElement | null
</script>

<svelte:document bind:activeElement />

{#if ctx.pickupOccasion}
  <div
    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-auto pb-4"
  >
    <!-- TODO: Show product details -->
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
          <!--
            Show number input when there are products selected, and also keep it visible as long as the input retains focus.
            This way, we improve the UX when deleting the contents of the input field and allow typing in a new number instead.
          -->
          {#if ctx.getProductCount(id) > 0 || activeElement === numberInputs[id]}
            <div
              class="gap-1 flex justify-between w-full items-stretch text-center border-y rounded-md border-primary h-12"
            >
              <!-- TODO: Removing the last product doesn't work - maybe we need to clear it from localStorage too -->
              <Button
                size="icon"
                class="size-12"
                onclick={() => ctx.removeProduct(id, 1)}
                aria-label="Ta bort 1"><LucideMinus class="size-5" /></Button
              >
              <input
                type="number"
                min="0"
                bind:this={numberInputs[id]}
                onfocusin={() => numberInputs[id].select()}
                bind:value={
                  () => ctx.getProductCount(id),
                  (newVal) => ctx.setProductCount(id, newVal)
                }
                class="text-center text-lg w-full reset-style"
              />
              <Button
                size="icon"
                class="size-12"
                onclick={() => ctx.addProduct(id, 1)}
                aria-label="Lägg till 1"><LucidePlus class="size-5" /></Button
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

<style>
  .reset-style {
    appearance: textfield;
  }

  .reset-style::-webkit-outer-spin-button,
  .reset-style::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
