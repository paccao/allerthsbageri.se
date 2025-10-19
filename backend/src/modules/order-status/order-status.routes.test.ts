import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import type {
  CreateOrderStatusBody,
  OrderStatus,
} from './order-status.schemas.ts'

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

  test.only('can create and get order statuses', async (t: TestContext) => {
    const badOrderStatus = {
      status: 'anythingGoes',
    }

    const badResponse = await app.inject({
      method: 'POST',
      url: `/api/order-status/`,
      body: badOrderStatus,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badResponse.statusCode,
      400,
      'Should give status 400 when status does not match the literals in the schema',
    )

    const goodOrderStatus: CreateOrderStatusBody = {
      status: 'IN_PROGRESS',
    }

    const goodResponse = await app.inject({
      method: 'POST',
      url: `/api/order-status/`,
      body: goodOrderStatus,
      headers: { cookie },
    })

    const createdResDeserialized = goodResponse.json()

    t.assert.strictEqual(goodResponse.statusCode, 201)
    t.assert.strictEqual(
      createdResDeserialized.status,
      goodOrderStatus.status,
      'Created order status has the same value as provided in the body',
    )

    const listResponse = await app.inject({
      method: 'GET',
      url: `/api/order-status/`,
      headers: { cookie },
    })
    const listDeserialized = listResponse.json() as Array<OrderStatus>

    t.assert.strictEqual(listResponse.statusCode, 200)
    t.assert.strictEqual(
      listDeserialized.some(
        (item) => item.status === createdResDeserialized.status,
      ),
      true,
      'can list all order-statuses',
    )

    const getByIdResponse = await app.inject({
      method: 'GET',
      url: `/api/order-status/${createdResDeserialized.id}`,
      headers: { cookie },
    })

    t.assert.strictEqual(
      getByIdResponse.json().id,
      createdResDeserialized.id,
      'can get order-status by ID',
    )
  })

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, productAdmin.username))
  })
})
