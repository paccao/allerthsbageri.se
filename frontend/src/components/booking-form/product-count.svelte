<script lang="ts">
  import { Button } from '$components/ui/button'

  import LucideMinus from 'virtual:icons/lucide/minus'
  import LucidePlus from 'virtual:icons/lucide/plus'
  import { bookingContext } from './context'
  import type { Product } from './booking-form.svelte'

  const ctx = bookingContext.get()

  const sizes = {
    md: { container: 'h-10 max-w-32', button: 'size-10' },
    lg: { container: 'h-12 max-w-48', button: 'size-12' },
  }

  type Props = {
    productId: Product['id']
    size?: keyof typeof sizes
  }
  let { productId, size = 'lg' }: Props = $props()
  let count = $derived(ctx.getProductCount(productId))
</script>

<div
  class={[
    'gap-1 flex justify-between w-full items-stretch text-center border-y rounded-md border-primary',
    sizes[size].container,
  ]}
>
  <Button
    size="icon"
    class={sizes[size].button}
    onclick={() => ctx.removeProduct(productId, 1)}
    aria-label="Ta bort 1"><LucideMinus class="size-5" /></Button
  >
  <input
    type="number"
    min="0"
    onfocusin={(event) => event.currentTarget.select()}
    value={count}
    onchange={(event) => {
      const val = event.currentTarget.value

      // Only update state for numeric values to allow clearing
      // the input with the keyboard and then typing something else.
      if (val === '') return

      ctx.setProductCount(productId, parseInt(val))
    }}
    onfocusout={(event) => {
      // Revert to the current value if nothing new was typed to make it harder
      // to remove the item by accidentally moving focus away from the input.
      if (event.currentTarget.value === '') {
        event.currentTarget.value = count.toString()
      }
    }}
    class="text-center text-lg w-full reset-style"
  />
  <Button
    size="icon"
    class={sizes[size].button}
    onclick={() => ctx.addProduct(productId, 1)}
    aria-label="Lägg till 1"><LucidePlus class="size-5" /></Button
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
