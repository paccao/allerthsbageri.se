<script lang="ts">
  import * as Sidebar from '$components/ui/sidebar/index.js'
  import type { WithoutChildren } from '$lib/utils.js'
  import type { ComponentProps } from 'svelte'

  let {
    items,
    ...restProps
  }: {
    items: { title: string; url: string; icon: string }[]
  } & WithoutChildren<ComponentProps<typeof Sidebar.Group>> = $props()
</script>

<Sidebar.Group {...restProps}>
  <Sidebar.GroupContent>
    <Sidebar.Menu>
      {#each items as item (item.title)}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton>
            {#snippet child({ props })}
              <a href={item.url} {...props}>
                <span class={item.icon}></span>
                <span>{item.title}</span>
              </a>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      {/each}
    </Sidebar.Menu>
  </Sidebar.GroupContent>
</Sidebar.Group>
