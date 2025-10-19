import env from './env.ts'

const openAPITagDefinitions = {
  auth: {
    description: 'Authentication and user account',
  },
  customers: {
    description: 'Customers who order products or activities',
  },
  customerOrders: {
    description:
      'Orders made by the customers. Contains relations to all order individual order items and to the status of the order.',
  },
  },
  pickups: {
    description:
      'Pickup occasions, where customers receive their ordered products',
  },
  products: {
    description: 'Products the customer can order',
  },
  product_details: {
    description:
      'Details about a specific product. These can be re-used for multiple pickup occasions, but if you want significant changes you should create a new product detail instead.',
  },
} as const

type TagName = keyof typeof openAPITagDefinitions
type Tag = (typeof openAPITagDefinitions)[TagName] & { name: TagName }

const openAPITags = Object.entries(openAPITagDefinitions).reduce(
  (tags, [name, tag]) => {
    const tagName = name as unknown as TagName
    tags[tagName] = { name: tagName, ...tag }
    return tags
  },
  {} as Record<TagName, Tag>,
)

/**
 * Format valid OpenAPI tags as an array.
 */
export function getTags(...tags: (keyof typeof openAPITags)[]) {
  return tags
}

export default {
  prefix: env.OPENAPI_PREFIX,
  tags: openAPITags,
}
