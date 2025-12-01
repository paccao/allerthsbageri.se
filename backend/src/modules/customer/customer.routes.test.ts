import { before, suite, test, type TestContext } from 'node:test'

import type { Customer } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import { createInMemoryTestDB } from '#db/test-db.ts'
import startApp from '#src/app.ts'
import { createDependencyContainer } from '#src/di-container.ts'

const app = await startApp(
  createDependencyContainer({ db: await createInMemoryTestDB() }),
)
const { assertAuthRequired, createAdminUser } = getTestingUtils(app)

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
    updatedPhone: '+46705888222',
  }

  const customer4 = {
    name: 'Customer4',
    phone: '+46703444444',
  }

  const customer5 = {
    name: 'Customer5',
    phone: '+46703555555',
  }

  const customer6 = {
    name: 'Customer6',
    phone: '+46703666666',
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
    await assertAuthRequired({ method: 'POST', url: '/api/customers' }, t)

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

    await assertAuthRequired(
      { method: 'GET', url: `/api/customers/${created.id}` },
      t,
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

    await assertAuthRequired(
      { method: 'PATCH', url: `/api/customers/${created.id}` },
      t,
    )

    const updatedName = 'Updated Customer'

    const response2 = await app.inject({
      method: 'PATCH',
      url: `/api/customers/${created.id}`,
      body: { name: updatedName, phone: customer3.updatedPhone },
      headers: { cookie },
    })

    t.assert.strictEqual(response2.json().name, updatedName)
    t.assert.strictEqual(response2.json().phone, customer3.updatedPhone)

    const updatedName2 = 'New name'

    const response3 = await app.inject({
      method: 'PATCH',
      url: `/api/customers/${created.id}`,
      body: { name: updatedName2 },
      headers: { cookie },
    })

    t.assert.strictEqual(
      response3.json().name,
      updatedName2,
      'should allow partial updates',
    )
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

    await assertAuthRequired(
      { method: 'DELETE', url: `/api/customers/${created.id}` },
      t,
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

  test('should be possible to list all customers', async (t: TestContext) => {
    await Promise.all([
      app.inject({
        method: 'POST',
        url: '/api/customers',
        body: customer5,
        headers: { cookie },
      }),
      app.inject({
        method: 'POST',
        url: '/api/customers',
        body: customer6,
        headers: { cookie },
      }),
    ])

    await assertAuthRequired({ method: 'GET', url: `/api/customers` }, t)

    const response = await app.inject({
      method: 'GET',
      url: '/api/customers',
      headers: { cookie },
    })

    const customers: Customer[] = response.json()

    const wanted = customers.filter((c) =>
      [customer5.phone, customer6.phone].includes(c.phone),
    )

    t.assert.strictEqual(wanted.length, 2)
  })
})
