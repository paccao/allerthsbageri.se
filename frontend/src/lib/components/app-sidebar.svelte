<script lang="ts">
  import CameraIcon from '@tabler/icons-svelte/icons/camera'
  import DatabaseIcon from '@tabler/icons-svelte/icons/database'
  import FileAiIcon from '@tabler/icons-svelte/icons/file-ai'
  import FileDescriptionIcon from '@tabler/icons-svelte/icons/file-description'
  import FileWordIcon from '@tabler/icons-svelte/icons/file-word'
  import HelpIcon from '@tabler/icons-svelte/icons/help'
  import ReportIcon from '@tabler/icons-svelte/icons/report'
  import SearchIcon from '@tabler/icons-svelte/icons/search'
  import SettingsIcon from '@tabler/icons-svelte/icons/settings'
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
        icon: CameraIcon,
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
        icon: FileDescriptionIcon,
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
        icon: FileAiIcon,
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
        icon: SettingsIcon,
      },
      {
        title: 'Get Help',
        url: '#',
        icon: HelpIcon,
      },
      {
        title: 'Search',
        url: '#',
        icon: SearchIcon,
      },
    ],
    documents: [
      {
        name: 'Data Library',
        url: '#',
        icon: DatabaseIcon,
      },
      {
        name: 'Reports',
        url: '#',
        icon: ReportIcon,
      },
      {
        name: 'Word Assistant',
        url: '#',
        icon: FileWordIcon,
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
