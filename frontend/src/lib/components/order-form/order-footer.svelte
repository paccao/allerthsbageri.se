<script lang="ts">
  import { buttonVariants } from '$components/ui/button'
  import { cn } from '$lib/utils'
  import { getOrderContext } from './context'

  const ctx = getOrderContext()

  async function handleSubmitOrder(event: MouseEvent) {
    event.preventDefault()
    // IDEA: Show loading spinner after 500 ms while creating the order
    const response = await ctx.submitOrder()
    // IDEA: If loading spinner is added, hide it in .finally()

    if (response.ok) {
      // Proceed to order confirmation
      ctx.setStepIdFromHash(`#${ctx.nextStepId}`)
    } else {
      console.error(response.error)
      // NOTE: Maybe update validation and enabled steps here if necessary
    }
  }
</script>

<footer
  class="fixed right-0 bottom-0 left-0 z-50 flex w-full justify-center bg-background"
>
  <div
    class="pointer-events-none fixed right-0 bottom-14 left-0 z-20 h-8 w-full bg-linear-to-t from-black/5 to-transparent"
  ></div>

  <nav
    class="grid w-full max-w-(--breakpoint-sm) grid-cols-[1fr_max-content_1fr] items-center gap-2 px-4 py-2"
  >
    {#if ctx.prevStepId}
      <a
        href={`#${ctx.prevStepId}`}
        class={cn([
          'justify-self-start',
          buttonVariants({ variant: 'outline', size: 'lg' }),
        ])}
        ><span class="i-[lucide--chevron-left] size-4"></span><span
          >Tillbaka</span
        ></a
      >
    {:else}
      <div></div>
    {/if}

    <div>
      <span class="text-sm xs:hidden"
        >{ctx.stepIndex + 1}/{ctx.visibleSteps.length}</span
      >

      <nav class="hidden items-center gap-1 xs:flex">
        {#each ctx.visibleSteps as { id, title }}
          {@const enabled = ctx.canNavigateToStep(id)}
          <a
            class={cn([
              'size-4 rounded-full border border-black select-none',
              id === ctx.stepId
                ? 'bg-black'
                : 'hover:bg-black/20 focus:bg-black/20',
              !enabled && 'pointer-events-none border-black/50 opacity-50',
            ])}
            href={enabled ? `#${id}` : 'javascript:void(0)'}
            aria-label="Gå till steg: {title}"
          ></a>
        {/each}
      </nav>
    </div>

    {#if ctx.nextStepId}
      {@const enabled =
        ctx.canNavigateToStep(ctx.nextStepId) && !ctx.isSubmitting}
      <a
        href={enabled ? `#${ctx.nextStepId}` : 'javascript:void(0)'}
        class={cn([
          'justify-self-end',
          buttonVariants({ variant: 'default', size: 'lg' }),
        ])}
        onclick={ctx.canSubmitOrder ? handleSubmitOrder : undefined}
        aria-disabled={!enabled}
      >
        {#if ctx.step.nextButtonLabel}
          <span>{ctx.step.nextButtonLabel}</span>
        {:else}
          <span>Gå vidare</span><span class="i-[lucide--chevron-right] size-4"
          ></span>
        {/if}
      </a>
    {:else}
      <div></div>
    {/if}
  </nav>
</footer>
