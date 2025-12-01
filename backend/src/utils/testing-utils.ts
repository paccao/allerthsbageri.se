import startApp from '#src/app.ts'
import type { FastifyInstance, InjectOptions } from 'fastify'
import type { TestContext } from 'node:test'
import {
  createDependencyContainer,
  type DependencyContainer,
} from '#src/di-container.ts'
import { createInMemoryTestDB } from '#db/test-db.ts'
import apiConfig from '#config/api.ts'

if (!apiConfig.env.TEST) {
  throw new Error('This module should only be used for tests')
}

/**
 * Create an app instance, configured for the test environment.
 *
 * @param overrides — Optionally pass in specific implementations you want to use.
 * @returns An app instance
 */
export async function startTestApp(
  overrides: Partial<DependencyContainer> = {},
) {
  return startApp(
    createDependencyContainer({
      db: await createInMemoryTestDB(),
      ...overrides,
    }),
  )
}

export function getTestingUtils(app: FastifyInstance) {
  /**
   * Verify that a given API endpoint requires authentication.
   */
  async function assertAuthRequired(
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
  async function createAdminUser(body: {
    username: string
    name: string
    password: string
  }) {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up',
      body,
    })

    return response.headers['set-cookie'] as string
  }

  return {
    assertAuthRequired,
    createAdminUser,
  }
}
