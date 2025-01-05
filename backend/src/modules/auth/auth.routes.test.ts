import { suite, test, type TestContext } from 'node:test'

import startApp from '#src/app.ts'
import apiConfig from '#config/api.ts'

const app = await startApp()

suite.only('auth routes', () => {
  test.only('should be possible to sign up', async (t: TestContext) => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up',
      body: {
        username: 'admin1',
        name: 'Admin1',
        password: '123456',
      },
    })

    const hasSessionCookie = response.cookies.some(
      (c) => c.name === apiConfig.sessionCookieName,
    )

    t.assert.strictEqual(hasSessionCookie, true)
  })

  test.only('should be possible to sign in', async (t: TestContext) => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up',
      body: {
        username: 'admin2',
        name: 'Admin2',
        password: '123456',
      },
    })

    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      body: {
        username: 'admin2',
        password: '123456',
      },
    })

    const hasSessionCookie = signInResponse.cookies.some(
      (c) => c.name === apiConfig.sessionCookieName,
    )

    t.assert.strictEqual(hasSessionCookie, true)
  })
})
