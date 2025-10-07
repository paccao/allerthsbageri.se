import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import tailwind from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'

const site = 'https://www.allerthsbageri.se'

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [
    svelte({ compilerOptions: { experimental: { async: true } } }),
    sitemap({
      // Filter out some pages from the sitemap during the production build
      filter: (page) =>
        !['bokning'].map((path) => `${site}/${path}/`).includes(page),
    }),
  ],
  vite: {
    resolve: {
      conditions: ['browser'],
    },
    plugins: [
      tailwind(),
      // NOTE: Allow using icons in both Svelte and Astro components
      // Workaround for https://github.com/unplugin/unplugin-icons/issues/253
      Icons({ compiler: 'svelte' }),
      Icons({ compiler: 'astro' }),
    ],
  },
  prefetch: {
    prefetchAll: true,
  },
  devToolbar: { enabled: false },
})
