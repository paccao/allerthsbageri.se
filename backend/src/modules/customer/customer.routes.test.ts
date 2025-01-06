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
    phone: '+4670311111',
  }

  const customer2 = {
    name: 'Customer2',
    phone: '+46703222222',
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
    const response = await app.inject({
      method: 'POST',
      url: '/api/customers',
      body: customer1,
      headers: { cookie },
    })

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

  // NOTE: Maybe updating the customer should only happen via POST /api/customers/:id
  // This would clearly separate the two operations 1) create new customer, and 2) update existing customer
  // And for the public frontend, we need special logic anyway. The create customer route should only be used by system admins.
  test('should be possible to update the customer name', async (t: TestContext) => {
    const response1 = await app.inject({
      method: 'POST',
      url: '/api/customers',
      body: customer2,
      headers: { cookie },
    })

    const created = response1.json()

    t.assert.strictEqual(created.name, customer2.name)

    const updatedName = 'Updated Customer2'

    const response2 = await app.inject({
      method: 'POST',
      url: `/api/customers/${created.id}`,
      body: { ...customer2, name: updatedName },
      headers: { cookie },
    })

    t.assert.strictEqual(response2.json().name, updatedName)
  })

  after(async () => {
    await db.delete(userTable).where(eq(userTable.username, admin1.username))

    await db
      .delete(customerTable)
      .where(
        or(
          ...[customer1, customer2].map(({ phone }) =>
            eq(customerTable.phone, phone),
          ),
        ),
      )

    // TODO: add an endpoint for deleting a customer
    // TODO: test that the endpoint for deleting a customer works as expected
  })
})
