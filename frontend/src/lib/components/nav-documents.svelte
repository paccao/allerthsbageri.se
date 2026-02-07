<script lang="ts">
  import * as DropdownMenu from '$components/ui/dropdown-menu/index.js'
  import * as Sidebar from '$components/ui/sidebar/index.js'

  let { items }: { items: { name: string; url: string; icon: string }[] } =
    $props()

  const sidebar = Sidebar.useSidebar()
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
  <Sidebar.GroupLabel>Documents</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each items as item (item.name)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton>
          {#snippet child({ props })}
            <a {...props} href={item.url}>
              <span class={item.icon}></span>
              <span>{item.name}</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <Sidebar.MenuAction
                {...props}
                showOnHover
                class="rounded-sm data-[state=open]:bg-accent"
              >
                <span class="i-[tabler--dots] size-4"></span>
                <span class="sr-only">More</span>
              </Sidebar.MenuAction>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            class="w-24 rounded-lg"
            side={sidebar.isMobile ? 'bottom' : 'right'}
            align={sidebar.isMobile ? 'end' : 'start'}
          >
            <DropdownMenu.Item>
              <span class="i-[tabler--folder] size-4"></span>
              <span>Open</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <span class="i-[tabler--share-3] size-4"></span>
              <span>Share</span>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item variant="destructive">
              <span class="i-[tabler--trash] size-4"></span>
              <span>Delete</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Sidebar.MenuItem>
    {/each}
    <Sidebar.MenuItem>
      <Sidebar.MenuButton class="text-sidebar-foreground/70">
        <span class="i-[tabler--dots] size-4 text-sidebar-foreground/70"></span>
        <span>More</span>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  </Sidebar.Menu>
</Sidebar.Group>
