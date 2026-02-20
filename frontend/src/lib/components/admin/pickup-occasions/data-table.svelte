<script lang="ts" module>
  export const columns: ColumnDef<PickupOccasion>[] = [
    {
      accessorKey: 'name',
      header: 'Upphämtningstillfälle',
      cell: ({ row }) =>
        renderComponent(DataTableCellViewer, { item: row.original }),
      enableHiding: false,
    },
    {
      accessorKey: 'location',
      header: 'Plats',
      cell: ({ row }) => renderSnippet(DataTableLocation, { row }),
    },
    {
      accessorKey: 'orderStart',
      header: 'Order Start',
      cell: ({ row }) => renderSnippet(DataTableOrderStart, { row }),
    },
    {
      accessorKey: 'orderEnd',
      header: 'Order Avslut',
      cell: ({ row }) => renderSnippet(DataTableOrderEnd, { row }),
    },
    {
      accessorKey: 'pickupStart',
      header: 'Upphämtning Start',
      cell: ({ row }) => renderSnippet(DataTablePickupStart, { row }),
    },
    {
      accessorKey: 'pickupEnd',
      header: 'Upphämtning Avslut',
      cell: ({ row }) => renderSnippet(DataTablePickupEnd, { row }),
    },
  ]
</script>

<script lang="ts">
  import {
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getPaginationRowModel,
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type Row,
    type VisibilityState,
  } from '@tanstack/table-core'
  import type { PickupOccasion } from './schemas.js'
  import { createSvelteTable } from '$components/ui/data-table/data-table.svelte.js'
  import * as Tabs from '$components/ui/tabs/index.js'
  import * as Table from '$components/ui/table/index.js'
  import * as DropdownMenu from '$components/ui/dropdown-menu/index.js'
  import { Button } from '$components/ui/button/index.js'
  import * as Select from '$components/ui/select/index.js'
  import { Label } from '$components/ui/label/index.js'
  import { Badge } from '$components/ui/badge/index.js'
  import {
    FlexRender,
    renderComponent,
    renderSnippet,
  } from '$components/ui/data-table/index.js'
  import DataTableCellViewer from './data-table-cell-viewer.svelte'
  import { weekdayAndDateAndTime } from '$lib/datetime.js'

  let { pickupOccasions }: { pickupOccasions: PickupOccasion[] } = $props()

  let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 })
  let columnFilters = $state<ColumnFiltersState>([])
  let columnVisibility = $state<VisibilityState>({})

  let views = [
    {
      id: 'previous',
      label: 'Föregående',
      badge: 0,
    },
    {
      id: 'current',
      label: 'Nuvarande',
      badge: 0,
    },
    {
      id: 'future',
      label: 'Framtida',
      badge: 0,
    },
  ]

  let view = $state('current')
  let viewLabel = $derived(
    views.find((v) => view === v.id)?.label ?? 'Select a view',
  )

  let now = $state(new Date())

  let filterPickupOccasionsByView = $derived.by(() => {
    const currentDate = now

    if (view === 'previous') {
      return pickupOccasions.filter((p) => new Date(p.pickupEnd) < currentDate)
    } else if (view === 'current') {
      return pickupOccasions.filter(
        (p) =>
          new Date(p.pickupStart) <= currentDate &&
          currentDate <= new Date(p.pickupEnd),
      )
    } else if (view === 'future') {
      return pickupOccasions.filter(
        (p) => new Date(p.pickupStart) > currentDate,
      )
    }
    return pickupOccasions
  })

  const table = createSvelteTable({
    get data() {
      return filterPickupOccasionsByView
    },
    columns,
    state: {
      get pagination() {
        return pagination
      },
      get columnVisibility() {
        return columnVisibility
      },
    },
    getRowId: (row) => row.id.toString(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        pagination = updater(pagination)
      } else {
        pagination = updater
      }
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === 'function') {
        columnFilters = updater(columnFilters)
      } else {
        columnFilters = updater
      }
    },
    onColumnVisibilityChange: (updater) => {
      if (typeof updater === 'function') {
        columnVisibility = updater(columnVisibility)
      } else {
        columnVisibility = updater
      }
    },
  })
</script>

<Tabs.Root bind:value={view} class="w-full flex-col justify-start gap-6">
  <div class="flex items-center justify-between px-4 lg:px-6">
    <Label for="view-selector" class="sr-only">View</Label>
    <Select.Root type="single" bind:value={view}>
      <Select.Trigger
        class="flex w-fit @4xl/main:hidden"
        size="sm"
        id="view-selector"
      >
        {viewLabel}
      </Select.Trigger>
      <Select.Content>
        {#each views as view (view.id)}
          <Select.Item value={view.id}>{view.label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
    <Tabs.List
      class="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex"
    >
      {#each views as view (view.id)}
        <Tabs.Trigger value={view.id}>
          {view.label}
          {#if view.badge > 0}
            <Badge variant="secondary">{view.badge}</Badge>
          {/if}
        </Tabs.Trigger>
      {/each}
    </Tabs.List>
    <div class="flex items-center gap-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button variant="outline" size="sm" {...props}>
              <span class="i-[tabler--layout-columns] size-4"></span>
              <span class="hidden lg:inline">Visa/Dölj Kolumner</span>
              <span class="lg:hidden">Columns</span>
              <span class="i-[tabler--chevron-down] size-4"></span>
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" class="w-56">
          {#each table
            .getAllColumns()
            .filter((col) => typeof col.accessorFn !== 'undefined' && col.getCanHide()) as column (column.id)}
            <DropdownMenu.CheckboxItem
              class="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenu.CheckboxItem>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  </div>
  <Tabs.Content
    value={view}
    class="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
  >
    <div class="overflow-hidden rounded-lg border">
      <Table.Root>
        <Table.Header class="sticky top-0 z-10 bg-muted">
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <Table.Row>
              {#each headerGroup.headers as header (header.id)}
                <Table.Head colspan={header.colSpan}>
                  {#if !header.isPlaceholder}
                    <FlexRender
                      content={header.column.columnDef.header}
                      context={header.getContext()}
                    />
                  {/if}
                </Table.Head>
              {/each}
            </Table.Row>
          {/each}
        </Table.Header>
        <Table.Body class="**:data-[slot=table-cell]:first:w-8">
          {#if table.getRowModel().rows?.length}
            {#each table.getRowModel().rows as row, index (row.id)}
              {@render TableRow({ row, index })}
            {/each}
          {:else}
            <Table.Row>
              <Table.Cell colspan={columns.length} class="h-24 text-center">
                Kunde inte hitta några upphämtningstillfällen.
              </Table.Cell>
            </Table.Row>
          {/if}
        </Table.Body>
      </Table.Root>
    </div>
    <div class="flex items-center justify-between px-4">
      <div class="flex w-full items-center gap-8 lg:w-fit">
        <div class="hidden items-center gap-2 lg:flex">
          <Label for="rows-per-page" class="text-sm font-medium"
            >Rows per page</Label
          >
          <Select.Root
            type="single"
            bind:value={
              () => `${table.getState().pagination.pageSize}`,
              (v) => table.setPageSize(Number(v))
            }
          >
            <Select.Trigger size="sm" class="w-20" id="rows-per-page">
              {table.getState().pagination.pageSize}
            </Select.Trigger>
            <Select.Content side="top">
              {#each [10, 20, 30, 40, 50] as pageSize (pageSize)}
                <Select.Item value={pageSize.toString()}>
                  {pageSize}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
        <div class="flex w-fit items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of
          {table.getPageCount()}
        </div>
        <div class="ms-auto flex items-center gap-2 lg:ms-0">
          <Button
            variant="outline"
            class="hidden h-8 w-8 p-0 lg:flex"
            onclick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span class="sr-only">Go to first page</span>
            <span class="i-[tabler--chevron-left] size-4"></span>
          </Button>
          <Button
            variant="outline"
            class="size-8"
            size="icon"
            onclick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span class="sr-only">Go to previous page</span>
            <span class="i-[tabler--chevron-left] size-4"></span>
          </Button>
          <Button
            variant="outline"
            class="size-8"
            size="icon"
            onclick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span class="sr-only">Go to next page</span>
            <span class="i-[tabler--chevron-right] size-4"></span>
          </Button>
          <Button
            variant="outline"
            class="hidden size-8 lg:flex"
            size="icon"
            onclick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span class="sr-only">Go to last page</span>
            <span class="i-[tabler--chevron-right] size-4"></span>
          </Button>
        </div>
      </div>
    </div>
  </Tabs.Content>
</Tabs.Root>

{#snippet DataTableLocation({ row }: { row: Row<PickupOccasion> })}
  <div class="word-wrap">
    <Badge variant="outline" class="px-1.5">
      {row.original.location}
    </Badge>
  </div>
{/snippet}

{#snippet DataTableOrderStart({ row }: { row: Row<PickupOccasion> })}
  <div class="w-32">
    <p class="px-1.5 text-muted-foreground">
      {weekdayAndDateAndTime.format(row.original.orderStart)}
    </p>
  </div>
{/snippet}

{#snippet DataTableOrderEnd({ row }: { row: Row<PickupOccasion> })}
  <div class="w-32">
    <p class="px-1.5 text-muted-foreground">
      {weekdayAndDateAndTime.format(row.original.orderEnd)}
    </p>
  </div>
{/snippet}

{#snippet DataTablePickupStart({ row }: { row: Row<PickupOccasion> })}
  <div class="w-32">
    <p class="px-1.5 text-muted-foreground">
      {weekdayAndDateAndTime.format(row.original.pickupStart)}
    </p>
  </div>
{/snippet}

{#snippet DataTablePickupEnd({ row }: { row: Row<PickupOccasion> })}
  <div class="w-32">
    <p class="px-1.5 text-muted-foreground">
      {weekdayAndDateAndTime.format(row.original.pickupEnd)}
    </p>
  </div>
{/snippet}

{#snippet TableRow({ row, index }: { row: Row<PickupOccasion>; index: number })}
  <Table.Row data-state={row.getIsSelected() && 'selected'} class="relative ">
    {#each row.getVisibleCells() as cell (cell.id)}
      <Table.Cell>
        <FlexRender
          content={cell.column.columnDef.cell}
          context={cell.getContext()}
        />
      </Table.Cell>
    {/each}
  </Table.Row>
{/snippet}
