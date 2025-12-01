import { suite, test, type TestContext } from 'node:test'

import startApp from '#src/app.ts'
import { createDependencyContainer } from './di-container.ts'
import { createInMemoryTestDB } from '#db/test-db.ts'

const app = await startApp(
  createDependencyContainer({ db: await createInMemoryTestDB() }),
)

suite('app setup', () => {
  test('GET /health-check should return status OK', async (t: TestContext) => {
    const response = await app.inject({
      method: 'GET',
      url: '/health-check',
    })

    t.assert.strictEqual(response.statusCode, 200)
    t.assert.deepStrictEqual(response.json(), { ok: true })
  })

  test('OpenAPI docs should only be available during development', async (t: TestContext) => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/docs',
    })

    t.assert.strictEqual(response.statusCode, 404)
  })
})
