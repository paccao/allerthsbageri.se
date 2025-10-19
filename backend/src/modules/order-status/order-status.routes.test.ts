import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import type { CreateOrderStatusBody } from './order-status.schemas.ts'

const app = await startApp()
const { createAdminUser } = getTestingUtils(app)

suite.only('order status routes', () => {
  const productAdmin = {
    username: 'productAdmin',
    name: 'productAdmin',
    password: '123456',
  }

  let cookie: string

  before(async () => {
    cookie = await createAdminUser(productAdmin)
  })

  test.only('can create order statuses', async (t: TestContext) => {
    const badOrderStatus = {
      status: 'anythingGoes',
    }

    const badResponse = await app.inject({
      method: 'POST',
      url: `/api/order-status/`,
      body: badOrderStatus,
      headers: { cookie },
    })

    t.assert.strictEqual(badResponse.statusCode, 400)

    const goodOrderStatus: CreateOrderStatusBody = {
      status: 'IN_PROGRESS',
    }

    const goodResponse = await app.inject({
      method: 'POST',
      url: `/api/order-status/`,
      body: goodOrderStatus,
      headers: { cookie },
    })

    t.assert.strictEqual(goodResponse.statusCode, 201)
    t.assert.strictEqual(goodResponse.json().status, goodOrderStatus.status)
  })

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, productAdmin.username))
  })
})
