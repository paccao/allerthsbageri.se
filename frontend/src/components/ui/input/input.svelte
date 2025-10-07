<script lang="ts" module>
  const baseClasses =
    'border-input selection:bg-primary selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground shadow-xs flex h-10 w-full min-w-0 rounded-md border px-3 dark:bg-input/30 outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 '
  const focusClasses =
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'
  const ariaClasses =
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'

  export const inputClasses = [
    'bg-background py-1 text-base md:text-sm',
    baseClasses,
    focusClasses,
    ariaClasses,
  ].join(' ')
</script>

<script lang="ts">
  import type {
    HTMLInputAttributes,
    HTMLInputTypeAttribute,
  } from 'svelte/elements'
  import { cn, type WithElementRef } from '$lib/utils.js'

  type InputType = Exclude<HTMLInputTypeAttribute, 'file'>

  type Props = WithElementRef<
    Omit<HTMLInputAttributes, 'type'> &
      (
        | { type: 'file'; files?: FileList }
        | { type?: InputType; files?: undefined }
      )
  >

  let {
    ref = $bindable(null),
    value = $bindable(),
    type,
    files = $bindable(),
    class: className,
    ...restProps
  }: Props = $props()
</script>

{#if type === 'file'}
  <input
    bind:this={ref}
    data-slot="input"
    class={cn(
      'bg-transparent pt-1.5 text-sm font-medium',
      baseClasses,
      focusClasses,
      ariaClasses,
      className,
    )}
    type="file"
    bind:files
    bind:value
    {...restProps}
  />
{:else}
  <input
    bind:this={ref}
    data-slot="input"
    class={cn(inputClasses, className)}
    {type}
    bind:value
    {...restProps}
  />
{/if}
