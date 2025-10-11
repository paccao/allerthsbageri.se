<script lang="ts">
  import { cn, type WithElementRef } from '$lib/utils.js'
  import type { HTMLAttributes } from 'svelte/elements'

  type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    as?: 'div' | 'output'
  }

  let {
    ref = $bindable(null),
    class: className,
    children,
    as = 'div',
    ...restProps
  }: Props = $props()
</script>

<svelte:element
  this={as}
  bind:this={ref}
  data-slot="card-footer"
  class={cn('[.border-t]:pt-6 flex items-center px-6', className)}
  {...restProps}
>
  {@render children?.()}
</svelte:element>
