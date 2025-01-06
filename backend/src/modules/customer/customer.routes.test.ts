import { after, before, suite, test, type TestContext } from 'node:test'
import { eq, or } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { customerTable, userTable } from '#db/schema.ts'

const app = await startApp()

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

suite('customer routes', () => {
  const admin1 = {
    username: 'customer_admin1',
    name: 'Admin1',
    password: '123456',
  }

  const customer1 = {
    name: 'Customer1',
    phone: '+46703111111',
  }

  const customer2 = {
    name: 'Customer2',
    phone: '+46703222222',
  }

  const customer3 = {
    name: 'Customer3',
    phone: '+46703333333',
  }

  const customer4 = {
    name: 'Customer4',
    phone: '+46703444444',
  }

  const customerInvalidPhone = {
    name: 'Invalid Customer',
    phone: '+46123',
  }

  let cookie: string

  before(async () => {
    cookie = await createAdminUser(admin1)
  })

  test('should be possible to create a customer', async (t: TestContext) => {
    const authResponse = await app.inject({
      method: 'POST',
      url: '/api/customers',
    })

    t.assert.strictEqual(
      authResponse.statusCode,
      401,
      'valid auth should be required',
    )

    const response = await app.inject({
      method: 'POST',
      url: '/api/customers',
      body: customer1,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 201)
    t.assert.strictEqual(response.json().name, customer1.name)
  })

  test('should not accept invalid phone numbers', async (t: TestContext) => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/customers',
      body: customerInvalidPhone,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 400)
  })

  test('should be possible to get a customer by id', async (t: TestContext) => {
    const response1 = await app.inject({
      method: 'POST',
      url: '/api/customers',
      body: customer2,
      headers: { cookie },
    })

    t.assert.strictEqual(response1.statusCode, 201)

    const created = response1.json()

    const authResponse = await app.inject({
      method: 'GET',
      url: `/api/customers/${created.id}`,
    })

    t.assert.strictEqual(
      authResponse.statusCode,
      401,
      'valid auth should be required',
    )

    const response2 = await app.inject({
      method: 'GET',
      url: `/api/customers/${created.id}`,
      headers: { cookie },
    })

    t.assert.strictEqual(response2.json().name, customer2.name)
  })

  test('get customer: should return 404 if customer does not exist', async (t: TestContext) => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/customers/9999999`,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 404)
  })

  test('should be possible to update the customer name', async (t: TestContext) => {
    const response1 = await app.inject({
      method: 'POST',
      url: '/api/customers',
      body: customer3,
      headers: { cookie },
    })

    const created = response1.json()

    t.assert.strictEqual(created.name, customer3.name)

    const authResponse = await app.inject({
      method: 'PATCH',
      url: `/api/customers/${created.id}`,
    })

    t.assert.strictEqual(
      authResponse.statusCode,
      401,
      'valid auth should be required',
    )

    const updatedName = 'Updated Customer'

    const response2 = await app.inject({
      method: 'PATCH',
      url: `/api/customers/${created.id}`,
      body: { ...customer3, name: updatedName },
      headers: { cookie },
    })

    t.assert.strictEqual(response2.json().name, updatedName)
  })

  test('update customer: should return 404 if customer does not exist', async (t: TestContext) => {
    const response = await app.inject({
      method: 'PATCH',
      url: `/api/customers/9999999`,
      body: customer1,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 404)
  })

  test('should be possible to delete a customer', async (t: TestContext) => {
    const response1 = await app.inject({
      method: 'POST',
      url: '/api/customers',
      body: customer4,
      headers: { cookie },
    })

    const created = response1.json()

    const authResponse = await app.inject({
      method: 'DELETE',
      url: `/api/customers/${created.id}`,
    })

    t.assert.strictEqual(
      authResponse.statusCode,
      401,
      'valid auth should be required',
    )

    const response2 = await app.inject({
      method: 'DELETE',
      url: `/api/customers/${created.id}`,
      headers: { cookie },
    })

    t.assert.strictEqual(response2.statusCode, 204)

    const response3 = await app.inject({
      method: 'GET',
      url: `/api/customers/${created.id}`,
      headers: { cookie },
    })

    t.assert.strictEqual(response3.statusCode, 404)
  })

  test('delete customer: should return 204 even if customer does not exist', async (t: TestContext) => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/customers/9999999`,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 204)
  })

  after(async () => {
    await db.delete(userTable).where(eq(userTable.username, admin1.username))

    await db
      .delete(customerTable)
      .where(
        or(
          ...[customer1, customer2, customer3, customer4].map(({ phone }) =>
            eq(customerTable.phone, phone),
          ),
        ),
      )
  })
})
