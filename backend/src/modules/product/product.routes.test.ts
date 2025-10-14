import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'

const app = await startApp()
const { createAdminUser } = getTestingUtils(app)

suite.only('product routes', () => {
  const productAdmin = {
    username: 'productAdmin',
    name: 'productAdmin',
    password: '123456',
  }

  let cookie: string

  before(async () => {
    cookie = await createAdminUser(productAdmin)
  })

  test('products can be created', async (t: TestContext) => {
    const productDetail = {
      name: 'kladdkakekaka',
      description: 'En kaka gjord på surdeg med konsistensen av en kladdkaka',
      image: null,
      vatPercentage: 13,
    }

    const pickup = {
      name: 'Särlatorgets marknad',
      location:
        'Kakor, bröd, kex. Kom och hälsa på mig på särlatorgets marknad vetja!',
      bookingStart: new Date('2025-08-23T08:00:00.000Z'),
      bookingEnd: new Date('2025-08-28T17:00:00.000Z'),
      pickupStart: new Date('2025-08-29T09:00:00.000Z'),
      pickupEnd: new Date('2025-08-29T16:30:00.000Z'),
    }

    const product = {
      stock: 25,
      price: 7700,
      maxPerCustomer: 1,
      pickupOccassionId: 1,
      productDetailsId: 1,
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/products/',
      body: product,
      headers: { cookie },
    })

    const deserialized = response.json()

    t.assert.strictEqual(
      response.statusCode,
      400,
      'should be a bad request when either a pickup occasion or product detail in the product request body does not exist',
    )

    // Todo: test what happens when you pass different values of maxPerCustomer in CREATE
  })

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, productAdmin.username))
  })
})
