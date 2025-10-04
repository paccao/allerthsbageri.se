<script lang="ts">
  import { Button } from '$components/ui/button'

  import LucideMinus from 'virtual:icons/lucide/minus'
  import LucidePlus from 'virtual:icons/lucide/plus'
  import { bookingContext } from './context'
  import type { WithElementRef } from '$lib/utils'
  import type { Product } from './booking-form.svelte'

  const ctx = bookingContext.get()

  const sizes = {
    md: { container: 'h-10 max-w-32', button: 'size-10' },
    lg: { container: 'h-12 max-w-48', button: 'size-12' },
  }

  type Props = WithElementRef<
    {
      productId: Product['id']
      size?: keyof typeof sizes
    },
    HTMLInputElement
  >
  let { productId, size = 'lg' }: Props = $props()
  let activeElement: HTMLElement | null = $state(null)
  let count = $derived(ctx.getProductCount(productId))
  let previous: number | null = $state(null)

  let element: HTMLInputElement | null = $state(null)
</script>

<svelte:document bind:activeElement />

{#if count > 0 || activeElement === element}
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
    <!-- IDEA: maybe only set the new value if the input lost focus -->
    <!-- IDEA: Maybe keep setProductCount simple and keep the logic for removing the orderItem separate -->
    <!-- If we keep the input separate and only remove the order item if the input doesn't have focus, then we solve this issue -->
    <!--
    Or add an optional parameter to setProductCount(id, count, remove = true), then we could call with `remove = false` in cases where we don't want to autoremove
    And then we could call with `remove = true` on focusout
    -->

    <!-- bind:value={
        () => ctx.getProductCount(productId),
        (newVal) => {
          console.log(newVal, 'hasFocus:', activeElement === element)
          ctx.setProductCount(productId, newVal)

          if (newVal === 0) {
            // IDEA: Save the previous value but don't update if the new value is '', undefined or 0
          } else {
            ctx.setProductCount(productId, newVal)
          }
        }
      } -->
    <input
      type="number"
      min="0"
      bind:this={element}
      onfocusin={() => element?.select?.()}
      value={count}
      onchange={(event) => {
        const val = event.currentTarget.value

        if (val === '') {
          // Preserve the state
          previous = count
          return
        }

        ctx.setProductCount(productId, parseInt(val))
      }}
      onfocusout={(event) => {
        console.log('focusout', {
          count,
          value: event.currentTarget.value,
          previous,
        })
        if (event.currentTarget.value === '' && previous !== null) {
          ctx.setProductCount(productId, previous)
          event.currentTarget.value = previous.toString()
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
