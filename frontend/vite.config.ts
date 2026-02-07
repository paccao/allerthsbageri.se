import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { keystatic } from 'keystatic-sveltekit'
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'

export default defineConfig({
  plugins: [tailwindcss(), keystatic(), enhancedImages(), sveltekit()],
  // Ensure the SvelteKit app is running on 127.0.0.1 to be consistent with Keystatic
  // For production, we want the host to be determined by the runtime instead
  server: import.meta.env.DEV ? { host: '127.0.0.1' } : undefined,
})
