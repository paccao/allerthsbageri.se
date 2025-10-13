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
      $components: './src/components',
      '$components/*': './src/components/*',
      $assets: './src/assets',
      '$assets/*': './src/assets/*',
    },
  },
}

export default config
