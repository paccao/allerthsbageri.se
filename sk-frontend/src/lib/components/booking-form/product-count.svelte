<script lang="ts">
  import { Button } from '$components/ui/button'

  import { getBookingContext } from './context'
  import type { Product } from './booking-form.svelte'
  import { inputClasses } from '$components/ui/input/input.svelte'
  import { cn } from '$lib/utils'

  const ctx = getBookingContext()

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
  const counterId = $props.id()
</script>

<div
  class={[
    'flex w-full items-stretch justify-between gap-1 rounded-2xl text-center outline-1 -outline-offset-1 outline-black',
    sizes[size].container,
    className,
  ]}
>
  <Button
    size="icon"
    class={sizes[size].button}
    onclick={() => ctx.removeProduct(productId, 1)}
    aria-label="Ta bort 1"
    ><span class="i-[lucide--minus] {sizes[size].icon}"></span></Button
  >
  <label class="sr-only" for={counterId}>Ändra antal produkter</label>
  <input
    id={counterId}
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

      // 1) Only update state for numeric values to allow clearing
      //    the input with the keyboard and then typing something else.
      // 2) Delay updating the state until the input loses focus if the value is 0
      //    This prevents accidentally removing the last item when decreasing
      //    the amount with the down arrow key.
      if (Number.isInteger(val) && val !== 0) {
        ctx.setProductCount(productId, val)
      }
    }}
    onblur={(event) => {
      // Revert to the current value if no new numeric value was entered.
      // This prevents accidentally removing the item by moving focus away from the input.
      if (event.currentTarget.value === '') {
        event.currentTarget.value = count.toString()
      } else if (event.currentTarget.value === '0') {
        // Only set the count to 0 when leaving the input
        ctx.setProductCount(productId, parseInt(event.currentTarget.value))
      }
    }}
    class={cn([
      inputClasses,
      'reset-style h-full border-0 p-0 text-center text-base! shadow-none',
    ])}
  />
  <Button
    size="icon"
    class={sizes[size].button}
    onclick={() => ctx.addProduct(productId, 1)}
    aria-label="Lägg till 1"
    ><span class="i-[lucide--plus] {sizes[size].icon}"></span></Button
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
