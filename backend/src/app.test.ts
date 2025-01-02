import startApp from './app.ts'
import { test, expect } from 'vitest'

const app = await startApp()

test('GET /health-check should return status OK', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/health-check',
  })

  expect(response.statusCode).toBe(200)
  expect(response.json()).toEqual({ ok: true })
})

test('OpenAPI docs should only be available during development', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/docs',
  })

  expect(response.statusCode).toBe(404)
})
