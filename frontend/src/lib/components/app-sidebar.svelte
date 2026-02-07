<script lang="ts">
  import NavDocuments from './nav-documents.svelte'
  import NavMain from './nav-main.svelte'
  import NavSecondary from './nav-secondary.svelte'
  import NavUser from './nav-user.svelte'
  import * as Sidebar from '$components/ui/sidebar/index.js'
  import { getSettings } from '$lib/data/settings.remote'
  import type { ComponentProps } from 'svelte'
  import allerthsBageriLogo from '$assets/allerths-bageri-logo.jpeg?enhanced'

  const data = {
    user: {
      name: 'shadcn',
      email: 'm@example.com',
      avatar: '',
    },
    navMain: [
      {
        title: 'Dashboard',
        url: '#',
        icon: 'i-[tabler--dashboard]',
      },
      {
        title: 'Lifecycle',
        url: '#',
        icon: 'i-[tabler--list-details]',
      },
      {
        title: 'Analytics',
        url: '#',
        icon: 'i-[tabler--chart-bar]',
      },
      {
        title: 'Projects',
        url: '#',
        icon: 'i-[tabler--folder]',
      },
      {
        title: 'Team',
        url: '#',
        icon: 'i-[tabler--users]',
      },
    ],
    navClouds: [
      {
        title: 'Capture',
        icon: 'i-[tabler--camera]',
        isActive: true,
        url: '#',
        items: [
          {
            title: 'Active Proposals',
            url: '#',
          },
          {
            title: 'Archived',
            url: '#',
          },
        ],
      },
      {
        title: 'Proposal',
        icon: 'i-[tabler--file-description]',
        url: '#',
        items: [
          {
            title: 'Active Proposals',
            url: '#',
          },
          {
            title: 'Archived',
            url: '#',
          },
        ],
      },
      {
        title: 'Prompts',
        icon: 'i-[tabler--file-ai]',
        url: '#',
        items: [
          {
            title: 'Active Proposals',
            url: '#',
          },
          {
            title: 'Archived',
            url: '#',
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: 'Settings',
        url: '#',
        icon: 'i-[tabler--settings]',
      },
      {
        title: 'Get Help',
        url: '#',
        icon: 'i-[tabler--help]',
      },
      {
        title: 'Search',
        url: '#',
        icon: 'i-[tabler--search]',
      },
    ],
    documents: [
      {
        name: 'Data Library',
        url: '#',
        icon: 'i-[tabler--database]',
      },
      {
        name: 'Reports',
        url: '#',
        icon: 'i-[tabler--report]',
      },
      {
        name: 'Word Assistant',
        url: '#',
        icon: 'i-[tabler--file-word]',
      },
    ],
  }

  let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props()
  const { siteName } = await getSettings()
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:p-1.5!">
          {#snippet child({ props })}
            <a href="##" {...props}>
              <enhanced:img
                src={allerthsBageriLogo}
                alt="logotyp"
                class="mr-2 inline-block size-5 rounded-full object-cover shadow-md"
              />
              <span class="text-base font-semibold">{siteName}</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={data.navMain} />
    <NavDocuments items={data.documents} />
    <NavSecondary items={data.navSecondary} class="mt-auto" />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser user={data.user} />
  </Sidebar.Footer>
</Sidebar.Root>
