import env from './env.ts'

const openAPITags = {
  auth: {
    description: 'Authentication and user account',
  },
  pickups: {
    description:
      'Pickup occasions, where customers receive their ordered products',
  },
  customers: {
    description: 'Customers who order products or activities',
  },
  orders: {
    description: 'Customer orders',
  },
} as const

type TagName = keyof typeof openAPITags
type Tag = (typeof openAPITags)[TagName] & { name: TagName }

export default {
  openAPIPrefix: env.OPENAPI_PREFIX,
  openAPITags: Object.entries(openAPITags).reduce(
    (tags, [name, tag]) => {
      const tagName = name as unknown as TagName
      tags[tagName] = { name: tagName, ...tag }
      return tags
    },
    {} as Record<TagName, Tag>,
  ),
}
