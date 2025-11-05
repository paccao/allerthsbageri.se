<script lang="ts">
    import { cn } from '$lib/utils'
    
    type Props = {
      class?: string
    }
    let { class: className }: Props = $props()
</script>


<span class={cn('my-12 w-7 mx-auto border-t flex', className)}></span>
