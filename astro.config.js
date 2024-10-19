import { defineConfig, passthroughImageService } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import basicSSL from '@vitejs/plugin-basic-ssl'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.allerthsbageri.se',
  integrations: [tailwind(), svelte(), sitemap()],
  image: {
    service: passthroughImageService(),
  },
  vite: {
    plugins: [basicSSL()],
  },
})
