<script lang="ts">
  import * as Sidebar from '$components/ui/sidebar/index.js'
  import AppSidebar from '$components/app-sidebar.svelte'
  import SiteHeader from '$components/site-header.svelte'
  import SectionCards from '$components/section-cards.svelte'
  import ChartAreaInteractive from '$components/chart-area-interactive.svelte'
  import DataTable from '$components/admin/pickup-occasions/data-table.svelte'
  import { getPickupOccasionsWithDetails } from '$lib/data/pickup-occasion.remote'

  const pickupOccasions = await getPickupOccasionsWithDetails()
</script>

<Sidebar.Provider
  style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
  <AppSidebar variant="inset" />
  <Sidebar.Inset>
    <SiteHeader />
    <div class="flex flex-1 flex-col">
      <div class="@container/main flex flex-1 flex-col gap-2">
        <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div class="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable {pickupOccasions} />
        </div>
      </div>
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
