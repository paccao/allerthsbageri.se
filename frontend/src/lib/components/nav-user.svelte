<script lang="ts">
  import * as Avatar from '$components/ui/avatar/index.js'
  import * as DropdownMenu from '$components/ui/dropdown-menu/index.js'
  import * as Sidebar from '$components/ui/sidebar/index.js'

  let { user }: { user: { name: string; email: string; avatar: string } } =
    $props()

  const sidebar = Sidebar.useSidebar()
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar.Root class="size-8 rounded-lg grayscale">
              <Avatar.Image src={user.avatar} alt={user.name} />
              <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.name}</span>
              <span class="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <span class="i-[tabler--dots-vertical] size-4"></span>
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
        side={sidebar.isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenu.Label class="p-0 font-normal">
          <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
            <Avatar.Root class="size-8 rounded-lg">
              <Avatar.Image src={user.avatar} alt={user.name} />
              <Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.name}</span>
              <span class="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Item>
            <span class="i-[tabler--user-circle] size-4"></span>
            Account
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <span class="i-[tabler--credit-card] size-4"></span>
            Billing
          </DropdownMenu.Item>
          <DropdownMenu.Item>
            <span class="i-[tabler--notification] size-4"></span>
            Notifications
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <span class="i-[tabler--logout] size-4"></span>
          Log out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
