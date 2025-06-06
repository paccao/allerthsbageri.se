import { defineConfig, passthroughImageService } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import tailwind from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.allerthsbageri.se',
  integrations: [svelte(), sitemap()],
  image: {
    service: passthroughImageService(),
  },
  vite: {
    resolve: {
      conditions: ['browser'],
    },
    plugins: [tailwind()]
  }
})
