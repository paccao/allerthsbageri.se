<script lang="ts">
  import { buttonVariants } from '$components/ui/button'
  import { cn } from '$lib/utils'
  import { getOrderContext } from './context'

  const ctx = getOrderContext()

  async function handleSubmitOrder(event: MouseEvent) {
    event.preventDefault()
    const response = await ctx.submitOrder()

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
    class="grid w-full max-w-(--breakpoint-sm) grid-cols-[1fr_max-content_1fr] items-center gap-2 p-2 xs:px-4"
  >
    {#if ctx.prevStepId}
      <a
        href={`#${ctx.prevStepId}`}
        class={cn([
          'w-full max-w-31 justify-self-start',
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
          buttonVariants({ variant: 'default', size: 'lg' }),
          'w-full max-w-31 justify-self-end',
          ctx.isDelayed && 'px-4',
        ])}
        onclick={ctx.canSubmitOrder ? handleSubmitOrder : undefined}
        aria-disabled={!enabled}
      >
        {#if ctx.isDelayed}
          <span class="spinner"></span>
        {:else if ctx.step.nextButtonLabel}
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

<style>
  .spinner {
    pointer-events: none;
    width: 1.3em;
    height: 1.3em;
    border: 2px solid #fff;
    border-right-color: transparent;
    border-radius: 50%;
    -webkit-animation: spin 1s linear infinite;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
</style>
