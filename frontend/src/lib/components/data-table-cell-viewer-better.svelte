<script lang="ts">
  import { AreaChart } from 'layerchart'
  import { scaleUtc } from 'd3-scale'
  import { curveNatural } from 'd3-shape'

  import * as Drawer from '$components/ui/drawer/index.js'
  import { Button } from '$components/ui/button/index.js'
  import * as Chart from '$components/ui/chart/index.js'
  import { IsMobile } from '$lib/hooks/is-mobile.svelte.js'
  import { Label } from '$components/ui/label/index.js'
  import { Input } from '$components/ui/input/index.js'
  import * as Select from '$components/ui/select/index.js'
  import { Separator } from '$components/ui/separator/index.js'
  import type { PickupOccasion } from './schemas-better.js'

  const chartData = [
    { date: new Date('2024-01-01'), desktop: 186, mobile: 80 },
    { date: new Date('2024-02-01'), desktop: 305, mobile: 200 },
    { date: new Date('2024-03-01'), desktop: 237, mobile: 120 },
    { date: new Date('2024-04-01'), desktop: 73, mobile: 190 },
    { date: new Date('2024-05-01'), desktop: 209, mobile: 130 },
    { date: new Date('2024-06-01'), desktop: 214, mobile: 140 },
  ]

  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'var(--primary)',
    },
    mobile: {
      label: 'Mobile',
      color: 'var(--primary)',
    },
  } satisfies Chart.ChartConfig

  const isMobile = new IsMobile()

  let { item }: { item: PickupOccasion } = $props()

  let name = $state(item.name)
  let location = $state(item.location)
  let orderStart = $state(item.orderStart)
  let orderEnd = $state(item.orderEnd)
  let pickupStart = $state(item.pickupStart)
  let pickupEnd = $state(item.pickupEnd)
</script>

<Drawer.Root direction={isMobile.current ? 'bottom' : 'right'}>
  <Drawer.Trigger>
    {#snippet child({ props })}
      <Button
        variant="link"
        class="w-fit px-0 text-start text-foreground"
        {...props}
      >
        {item.name}
      </Button>
    {/snippet}
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header class="gap-1">
      <Drawer.Title>{item.name}</Drawer.Title>
      <Drawer.Description
        >Showing total visitors for the last 6 months</Drawer.Description
      >
    </Drawer.Header>
    <div class="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
      {#if !isMobile.current}
        <Chart.Container config={chartConfig}>
          <AreaChart
            data={chartData}
            x="date"
            xScale={scaleUtc()}
            yDomain={[0, 600]}
            series={[
              {
                key: 'mobile',
                label: 'Mobile',
                color: chartConfig.mobile.color,
              },
              {
                key: 'desktop',
                label: 'Desktop',
                color: chartConfig.desktop.color,
              },
            ]}
            seriesLayout="stack"
            props={{
              area: {
                curve: curveNatural,
                'fill-opacity': 0.4,
                line: { class: 'stroke-1' },
                motion: 'tween',
              },
              xAxis: {
                format: (v) =>
                  v.toLocaleDateString('en-US', { month: 'short' }),
              },
              yAxis: { ticks: [0, 300, 600] },
            }}
          >
            {#snippet tooltip()}
              <Chart.Tooltip
                labelFormatter={(v: Date) => {
                  return v.toLocaleDateString('en-US', {
                    month: 'long',
                  })
                }}
                indicator="dot"
              />
            {/snippet}
          </AreaChart>
        </Chart.Container>
        <Separator />
        <div class="grid gap-2">
          <div class="flex gap-2 leading-none font-medium">
            Trending up by 5.2% this month
            <span class="i-[tabler--trending-up] size-4"></span>
          </div>
          <div class="text-muted-foreground">
            Showing total visitors for the last 6 months. This is just some
            random text to test the layout. It spans multiple lines and should
            wrap around.
          </div>
        </div>
        <Separator />
      {/if}
      <form class="flex flex-col gap-4">
        <div class="flex flex-col gap-3">
          <Label for="header">Name</Label>
          <Input id="header" value={item.name} />
        </div>
      </form>
    </div>
    <Drawer.Footer>
      <Button>Submit</Button>
      <Drawer.Close>
        {#snippet child({ props })}
          <Button variant="outline" {...props}>Done</Button>
        {/snippet}
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
