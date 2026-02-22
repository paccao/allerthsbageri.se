<script lang="ts">
  import { Calendar as CalendarPrimitive } from 'bits-ui'
  import {
    buttonVariants,
    type ButtonVariant,
  } from '$components/ui/button/index.js'
  import { cn } from '$lib/utils.js'

  let {
    ref = $bindable(null),
    class: className,
    children,
    variant = 'ghost',
    ...restProps
  }: CalendarPrimitive.NextButtonProps & {
    variant?: ButtonVariant
  } = $props()
</script>

{#snippet Fallback()}
  <span class="i-[lucide--chevron-right] size-4"></span>
{/snippet}

<CalendarPrimitive.NextButton
  bind:ref
  class={cn(
    buttonVariants({ variant }),
    'size-(--cell-size) bg-transparent p-0 select-none disabled:opacity-50 rtl:rotate-180',
    className,
  )}
  children={children || Fallback}
  {...restProps}
/>
