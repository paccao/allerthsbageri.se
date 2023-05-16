import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.allerthsbageri.se',
  integrations: [tailwind(), sitemap()],
  experimental: {
    assets: true,
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
})
