<script lang="ts">
  import { getSettings } from '$lib/data/settings.remote'
  import '@fontsource/italianno'
  import '@fontsource/quattrocento'
  import '../app.css'

  const { siteName } = await getSettings()
  let { children } = $props()
</script>

<svelte:head>
  <title>{siteName}</title>
</svelte:head>

{@render children?.()}
