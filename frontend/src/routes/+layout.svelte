<script lang="ts">
  import { getSettings } from '$lib/data/settings.remote'
  import '@fontsource/italianno'
  import '@fontsource/quattrocento'
  import '../app.css'

  let { children } = $props()
  const { siteName } = await getSettings()
</script>

<svelte:head>
  <title>{siteName}</title>
</svelte:head>

{@render children?.()}
