<script lang="ts">
  import LucideChevronLeft from 'virtual:icons/lucide/chevron-left'
  import LucideChevronRight from 'virtual:icons/lucide/chevron-right'
  import { buttonVariants } from '$components/ui/button'
  import { cn } from '$lib/utils'
  import { bookingContext } from './context'

  const ctx = bookingContext.get()
</script>

<footer
  class="flex justify-center fixed bottom-0 w-full left-0 right-0 bg-background"
>
  <div
    class="fixed bottom-18 z-20 bg-gradient-to-t from-black/5 to-transparent h-8 w-full left-0 right-0 pointer-events-none"
  ></div>

  <nav
    class="max-w-[var(--breakpoint-sm)] grid grid-cols-[1fr_max-content_1fr] gap-2 items-center p-4 w-full"
  >
    {#if ctx.prevStepId}
      <a
        href={`#${ctx.prevStepId}`}
        class={cn([
          'justify-self-start',
          buttonVariants({ variant: 'ghost', size: 'lg' }),
        ])}><LucideChevronLeft class="size-4" /><span>Tillbaka</span></a
      >
    {:else}
      <div></div>
    {/if}

    <div>
      <span class="xs:hidden text-sm"
        >{ctx.stepIndex + 1}/{ctx.visibleSteps.length}</span
      >

      <nav class="items-center gap-1 xs:flex hidden">
        {#each ctx.visibleSteps as { id, title }}
          {@const enabled = ctx.canNavigateToStep(id)}
          <a
            class={cn([
              'rounded-full size-4 border border-black',
              id === ctx.stepId
                ? 'bg-black'
                : 'hover:bg-black/20 focus:bg-black/20',
              !enabled && 'opacity-50 pointer-events-none border-black/50',
            ])}
            href={enabled ? `#${id}` : 'javascript:void(0)'}
            aria-label="Gå till steg: {title}"
          ></a>
        {/each}
      </nav>
    </div>

    {#if ctx.nextStepId}
      <!-- {@const canNavigateToNextStep = ctx.canNavigateToStep(ctx.nextStepId)} -->
      {@const canNavigateToNextStep = true}
      <a
        href={canNavigateToNextStep
          ? `#${ctx.nextStepId}`
          : 'javascript:void(0)'}
        class={cn([
          'justify-self-end',
          buttonVariants({ variant: 'default', size: 'lg' }),
        ])}
        aria-disabled={!canNavigateToNextStep}
      >
        {#if ctx.step.nextButtonLabel}
          <span>Skicka beställning</span>
        {:else}
          <span>Gå vidare</span><LucideChevronRight class="size-4" />
        {/if}
      </a>
    {:else}
      <div></div>
    {/if}
  </nav>
</footer>
