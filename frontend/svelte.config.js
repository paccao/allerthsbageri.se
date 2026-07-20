import adapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    experimental: {
      remoteFunctions: true,
      explicitEnvironmentVariables: true,
    },
    adapter: adapter(),
    alias: {
      $components: './src/lib/components',
      '$components/*': './src/lib/components/*',
      $assets: './src/lib/assets',
      '$assets/*': './src/lib/assets/*',
      $layouts: './src/lib/layouts',
      '$layouts/*': './src/lib/layouts/*',
    },
  },
  compilerOptions: { experimental: { async: true } },
}

export default config
