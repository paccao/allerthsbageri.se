import { suite, test, type TestContext } from 'node:test'

import { setupMockedInMemoryTestDB } from '#db/test-db.ts'
import apiConfig from '#config/api.ts'

// IDEA: If we execute on import, this could just be the first import and the rest would work as normal
// This would remove the need for dynamic imports of the app. Just add the test db mock at the top of the test suite imports and you're good to go
// A simpler API is much better, especially since we don't need to return the refercene to the `db` instance. We can just use it from the DB module as normal.
// import '#db/setup-test-db.ts'

await setupMockedInMemoryTestDB()

const startApp = (await import('#src/app.ts')).default
const app = await startApp()

function getSessionCookie(response: Awaited<ReturnType<typeof app.inject>>) {
  return response.cookies.find((c) => c.name === apiConfig.sessionCookieName)
}

suite('auth routes', () => {
  const admin1 = {
    username: 'admin1',
    name: 'Admin1',
    password: '123456',
  }
  const admin2 = {
    username: 'admin2',
    name: 'Admin2',
    password: '123456',
  }
  const admin3 = {
    username: 'admin3',
    name: 'Admin3',
    password: '123456',
  }

  test('should be possible to sign up', async (t: TestContext) => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up',
      body: admin1,
    })

    const sessionCookie = getSessionCookie(response)

    t.assert.notStrictEqual(sessionCookie, undefined)
  })

  test('should be possible to sign in', async (t: TestContext) => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up',
      body: admin2,
    })

    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      body: {
        username: admin2.username,
        password: admin2.password,
      },
    })

    const sessionCookie = getSessionCookie(signInResponse)

    t.assert.notStrictEqual(sessionCookie, undefined)
  })

  test('should be possible to sign out', async (t: TestContext) => {
    await app.inject({
      method: 'POST',
      url: '/api/auth/sign-up',
      body: admin3,
    })

    const signInResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      body: {
        username: admin3.username,
        password: admin3.password,
      },
    })

    const sessionCookie = getSessionCookie(signInResponse)

    t.assert.notStrictEqual(sessionCookie, undefined)
    t.assert.notStrictEqual(sessionCookie?.expires, undefined)
    t.assert.strictEqual(sessionCookie?.maxAge, undefined)

    const signOutResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-out',
      headers: {
        cookie: signInResponse.headers['set-cookie'],
      },
    })

    const signOutSessionCookie = getSessionCookie(signOutResponse)

    t.assert.notStrictEqual(signOutSessionCookie, undefined)
    t.assert.strictEqual(signOutSessionCookie?.maxAge, 0)
  })
})
