import { prerender } from '$app/server'
import { reader } from '$lib/keystatic'

export const getSettings = prerender(async () => {
  return reader.singletons.settings.readOrThrow()
})
