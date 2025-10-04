<script lang="ts">
  import { Button } from '$components/ui/button'

  import LucideMinus from 'virtual:icons/lucide/minus'
  import LucidePlus from 'virtual:icons/lucide/plus'
  import { bookingContext } from './context'
  import type { Product } from './booking-form.svelte'

  const ctx = bookingContext.get()

  const sizes = {
    // TODO: Fix buttons for md size. Make sure they fit within the input.
    // TODO: Rework icon sizes. Maybe turn icon button into a separate component
    // TODO: Fix icon colors - use currentColor or explicitly add white
    md: { container: 'h-10 text-base', button: 'size-10', icon: 'size-4' },
    lg: { container: 'h-12 text-lg', button: 'size-12', icon: 'size-5' },
  }

  type Props = {
    productId: Product['id']
    size?: keyof typeof sizes
    class?: string
  }
  let { productId, size = 'lg', class: className }: Props = $props()
  let count = $derived(ctx.getProductCount(productId))
</script>

<div
  class={[
    'gap-1 flex justify-between w-full items-stretch text-center border-y rounded-md border-primary',
    sizes[size].container,
    className,
  ]}
>
  <Button
    size="icon"
    class={sizes[size].button}
    onclick={() => ctx.removeProduct(productId, 1)}
    aria-label="Ta bort 1"><LucideMinus class={sizes[size].icon} /></Button
  >
  <input
    type="number"
    min="0"
    onfocusin={(event) => event.currentTarget.select()}
    value={count}
    oninput={(event) => {
      const val = parseInt(event.currentTarget.value)

      // Only update state for numeric values to allow clearing
      // the input with the keyboard and then typing something else.
      if (Number.isInteger(val)) {
        ctx.setProductCount(productId, val)
      }
    }}
    onfocusout={(event) => {
      // Revert to the current value if no new numeric value was entered.
      // This prevents accidentally removing the item by moving focus away from the input.
      if (event.currentTarget.value === '') {
        event.currentTarget.value = count.toString()
      }
    }}
    class="text-center w-full reset-style"
  />
  <Button
    size="icon"
    class={sizes[size].button}
    onclick={() => ctx.addProduct(productId, 1)}
    aria-label="Lägg till 1"><LucidePlus class={sizes[size].icon} /></Button
  >
</div>

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
