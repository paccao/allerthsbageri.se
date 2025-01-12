import openAPIConfig from '#config/openapi.ts'

/**
 * Format valid OpenAPI tags as an array.
 */
export function getTags(...tags: (keyof typeof openAPIConfig.openAPITags)[]) {
  return tags
}
