import { test, type TestContext } from 'node:test'

import startApp from './app.ts'

const app = await startApp()

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

// Check out more about testing at https://fastify.dev/docs/latest/Guides/Testing/
