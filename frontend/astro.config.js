import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import tailwind from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.allerthsbageri.se',
  integrations: [svelte(), sitemap()],
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
  devToolbar: { enabled: false },
})
