import adapter from '@sveltejs/adapter-node'
import { type Config } from '@sveltejs/kit'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const config: Config = {
  preprocess: vitePreprocess(),

  // TODO: Add existing ui components
  // TODO: make it work

  kit: {
    adapter: adapter(),
    alias: {
      $components: './src/lib/components',
      '$components/*': './src/lib/components/*',
      $assets: './src/lib/assets',
      '$assets/*': './src/lib/assets/*',
    },
  },
}

export default config
