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

export function getTestingUtils(app: FastifyInstance) {
  return {
    assertAuthRequired: assertAuthRequired.bind(null, app),
  }
}
