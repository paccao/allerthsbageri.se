import type { FastifyInstance, InjectOptions } from 'fastify'
import type { TestContext } from 'node:test'

/**
 * Verify that a given API endpoint requires authentication.
 */
async function assertAuthRequired(
  app: FastifyInstance,
  opts: Omit<InjectOptions, 'cookies' | 'headers'> & {
    // Cookie should intentionally be omitted to cause a HTTP 401 response
    headers?: InjectOptions['headers'] & { cookie: undefined }
  },
  t: TestContext,
) {
  const authResponse = await app.inject(opts)

  t.assert.strictEqual(
    authResponse.statusCode,
    401,
    `valid auth should be required for ${opts.method} ${opts.url}`,
  )
}

/**
 * Create an admin user who can make API requests.
 *
 * @returns A session cookie
 */
async function createAdminUser(
  app: FastifyInstance,
  body: {
    username: string
    name: string
    password: string
  },
) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/auth/sign-up',
    body,
  })

  return response.headers['set-cookie'] as string
}

export function getTestingUtils(app: FastifyInstance) {
  return {
    assertAuthRequired: assertAuthRequired.bind(null, app),
    createAdminUser: createAdminUser.bind(null, app),
  }
}
