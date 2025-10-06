<script lang="ts">
  import { Button } from '$components/ui/button'

  import LucideMinus from 'virtual:icons/lucide/minus'
  import LucidePlus from 'virtual:icons/lucide/plus'
  import { bookingContext } from './context'
  import type { Product } from './booking-form.svelte'
  import { inputClasses } from '$components/ui/input/input.svelte'
  import { cn } from '$lib/utils'

  const ctx = bookingContext.get()

  const sizes = {
    md: {
      container: 'h-10 text-base',
      button: 'size-10 rounded-xl',
      icon: 'size-4',
    },
    lg: {
      container: 'h-12 text-lg',
      button: 'size-12 rounded-xl',
      icon: 'size-5',
    },
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
    'gap-1 flex justify-between items-stretch text-center outline-black rounded-2xl w-full outline-1 -outline-offset-1',
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
    onbeforeinput={(event) => {
      // Only allow entering numeric values when using the keyboard
      if (event.data && Number.isNaN(parseInt(event.data, 10))) {
        event.preventDefault()
      }
    }}
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
    class={cn([
      inputClasses,
      'text-center reset-style p-0 shadow-none border-0',
    ])}
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
