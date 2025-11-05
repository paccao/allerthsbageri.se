<script lang="ts">
  import Navbar from '$components/navbar.svelte'
  import Footer from '$components/footer.svelte'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  type Props = {
    class?: string
    header?: boolean
    footer?: boolean
    children?: Snippet
  }

  let {
    class: className,
    header = false,
    footer = false,
    children,
  }: Props = $props()
</script>

{#if header}
  <Navbar />
{/if}

<main class={cn('mx-auto w-full', className)}>
  {@render children?.()}
</main>

{#if footer}
  <Footer />
{/if}
