import apiConfig from '@/config/api.ts'

/**
 * Format valid OpenAPI tags as an array.
 */
export function tags(...tags: (keyof typeof apiConfig.openAPITags)[]) {
  return tags
}
