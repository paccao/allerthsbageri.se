import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

// https://astro.build/config
export default defineConfig({
  site: 'https://allerthsbageri.se',
  integrations: [tailwind()],
  experimental: {
    assets: true,
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
})
