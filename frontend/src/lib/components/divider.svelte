<script lang="ts">
  import { cn } from '$lib/utils'

  type Props = {
    class?: string
  }
  let { class: className }: Props = $props()
</script>

<span class={cn('mx-auto my-12 flex w-7 border-t', className)}></span>
