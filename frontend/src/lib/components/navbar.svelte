<script lang="ts">
  import allerthsBageriLogo from '$assets/allerths-bageri-logo.jpeg?enhanced'
  import { SITE_NAME } from '$lib/constants'
  import { cn } from '$lib/utils'
  import { buttonVariants } from '$components/ui/button'
  import { page } from '$app/state'
</script>

<nav class="flex items-center justify-between px-4 py-2 shadow-sm">
  <a class="flex items-center gap-4" href="/">
    <enhanced:img
      src={allerthsBageriLogo}
      alt="Profilbild för Allerths Bageri"
      class="size-12 rounded-full object-cover shadow-md"
      loading="eager"
      fetchpriority="high"
    />
    <h1 class="pt-2 font-display text-3xl font-bold xs:text-4xl">
      {SITE_NAME}
    </h1>
  </a>

  <ul class="flex items-center gap-4">
    {#if page.route.id !== '/order'}
      <li>
        <a
          href="/order"
          class={cn([buttonVariants({ variant: 'outline', size: 'lg' })])}
        >
          Beställ ditt bröd!
        </a>
      </li>
    {/if}
  </ul>
</nav>
