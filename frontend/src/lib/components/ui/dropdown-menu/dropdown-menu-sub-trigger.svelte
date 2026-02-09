<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils.js'

  let {
    ref = $bindable(null),
    class: className,
    inset,
    children,
    ...restProps
  }: DropdownMenuPrimitive.SubTriggerProps & {
    inset?: boolean
  } = $props()
</script>

<DropdownMenuPrimitive.SubTrigger
  bind:ref
  data-slot="dropdown-menu-sub-trigger"
  data-inset={inset}
  class={cn(
    "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-inset:ps-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_[class*='i-']]:pointer-events-none [&_[class*='i-']]:shrink-0 [&_[class*='i-']:not([class*='size-'])]:size-4 [&_[class*='i-']:not([class*='text-'])]:text-muted-foreground",
    className,
  )}
  {...restProps}
>
  {@render children?.()}
  <span class="ms-auto i-[lucide--chevron-right] size-4"></span>
</DropdownMenuPrimitive.SubTrigger>
