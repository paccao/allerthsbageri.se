<script lang="ts">
  import { SITE_NAME } from '$lib/constants'
  import '@fontsource/italianno'
  import '@fontsource/quattrocento'
  import '../app.css'

  let { children } = $props()
</script>

<svelte:head>
  <title>{SITE_NAME}</title>
</svelte:head>

{@render children?.()}
