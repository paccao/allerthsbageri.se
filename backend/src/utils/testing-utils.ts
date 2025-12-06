import type { FastifyInstance, InjectOptions } from 'fastify'
import type { TestContext } from 'node:test'

import startApp from '#src/app.ts'
import {
  createDependencyContainer,
  type Dependencies,
  type DependencyContainer,
} from '#src/di-container.ts'
import { createInMemoryTestDB } from '#db/test-db.ts'
import apiConfig from '#config/api.ts'
import { DIContainer, type IDIContainer } from '#lib/rsdi/index.ts'

if (!apiConfig.env.TEST) {
  throw new Error('This module should only be used for tests')
}

/**
 * Create an app instance, configured for the test environment.
 *
 * @param overrides Optionally pass in specific implementations you want to use.
 * @returns An app instance
 */
export async function startTestApp(
  overrides?: IDIContainer<Partial<Dependencies>>,
) {
  return startApp(await getTestDeps(overrides))
}

/**
 * Get the testing dependencies, combined with potential overrides.
 *
 * Will use overrides if provided, testing dependencies if defined in this function,
 * and fall back to defaults from the dependency container.
 *
 * @param overrides Optionally pass in specific implementations you want to use.
 * @returns
 */
async function getTestDeps(
  overrides?: IDIContainer<Partial<Dependencies>>,
): Promise<DependencyContainer> {
  const testContainer = createDependencyContainer()

  /** Default dependencies used for tests */
  const testDependencyResolvers = Object.entries({
    db: async () => {
      const _db = await createInMemoryTestDB()
      return () => _db
    },
  } as const) as [keyof Dependencies, () => Promise<(...args: any[]) => any>][]

  const allTestDepsShouldBeOverridden =
    overrides && testDependencyResolvers.every(([key]) => overrides[key])

  if (allTestDepsShouldBeOverridden) {
    return testContainer.merge(overrides)
  }

  // Combine overrides with test dependencies
  let testDepsWithOverrides = new DIContainer<Partial<Dependencies>>()

  for (const [key, getResolver] of testDependencyResolvers) {
    // Use either overrides or the test dependencies
    // @ts-expect-error In this case it's actually OK to add dependencies since
    // we use the expected dependency keys.
    testDepsWithOverrides.add(key, overrides?.[key] ?? (await getResolver()))
  }

  return testContainer.merge(testDepsWithOverrides)
}

export function getTestingUtils(app: FastifyInstance) {
  /**
   * Ensure that a given API endpoint requires authentication.
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
