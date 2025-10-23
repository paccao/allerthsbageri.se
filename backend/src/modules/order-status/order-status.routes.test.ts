import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import type {
  CreateOrderStatusBody,
  OrderStatus,
  UpdateOrderStatusBody,
} from './order-status.schemas.ts'

const app = await startApp()
const { createAdminUser } = getTestingUtils(app)

suite.only('order status routes', () => {
  const orderStatusAdmin = {
    username: 'orderStatusAdmin',
    name: 'orderStatusAdmin',
    password: '123456',
  }

  let cookie: string

  before(async () => {
    cookie = await createAdminUser(orderStatusAdmin)
  })

  test('can create and get order statuses', async (t: TestContext) => {
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
      status: 'Bokad',
      color: 'blue',
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

  // todo: test what happens when no properties in the body is passed
  // todo: make sure the ID has not been updated when patched
  test.only('can update order statuses', async (t: TestContext) => {
    const orderStatus: CreateOrderStatusBody = {
      status: 'Bokad',
      color: 'green',
    }

    const createdResponse = await app.inject({
      method: 'POST',
      url: `/api/order-status/`,
      body: orderStatus,
      headers: { cookie },
    })

    const createdOrderStatusDeserialized = createdResponse.json()

    t.assert.strictEqual(createdResponse.statusCode, 201)

    const badInputRequests = [
      {
        id: createdOrderStatusDeserialized.id,
        body: {
          status: 909090,
        },
      },
      {
        id: createdOrderStatusDeserialized.id,
        body: {
          status: 'Bokad',
          color: 1203910293,
        },
      },
      {
        id: 'aoskdoaskd',
        body: {
          status: 'Bokad',
        },
      },
    ]

    for (let index = 0; index < badInputRequests.length; index++) {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/order-status/${badInputRequests[index]!.id}`,
        body: badInputRequests[index]!.body,
        headers: { cookie },
      })

      t.assert.strictEqual(
        res.statusCode,
        400,
        'Should return status 400 when an invalid input is sent',
      )
    }

    const noBodyProvidedRes = await app.inject({
      method: 'PATCH',
      url: `/api/order-status/${createdOrderStatusDeserialized.id}`,
      body: {},
      headers: { cookie },
    })

    t.assert.strictEqual(
      noBodyProvidedRes.statusCode,
      400,
      'Should return status 400 when no parameters in the body is sent',
    )

    const noIdProvided = await app.inject({
      method: 'PATCH',
      url: `/api/order-status/`,
      body: orderStatus,
      headers: { cookie },
    })

    t.assert.strictEqual(
      noIdProvided.statusCode,
      400,
      'Should return status 400 when no id parameter is sent in the url',
    )

    const idNotFound = await app.inject({
      method: 'PATCH',
      url: `/api/order-status/${createdOrderStatusDeserialized.id + 9997}`,
      body: orderStatus,
      headers: { cookie },
    })

    t.assert.strictEqual(
      idNotFound.statusCode,
      404,
      'Should return status 404 when no orderStatus with the provided params ID exists',
    )

    const goodUpdate: UpdateOrderStatusBody = {
      status: 'Upphämtad',
      color: 'green',
    }

    const goodUpdateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/order-status/${createdOrderStatusDeserialized.id}`,
      body: goodUpdate,
      headers: { cookie },
    })

    const goodUpdateDeserialized = goodUpdateResponse.json()

    t.assert.strictEqual(
      goodUpdateResponse.statusCode,
      200,
      'Should update when proper url params and body are provided',
    )
    t.assert.strictEqual(goodUpdateDeserialized.status, goodUpdate.status)
    t.assert.strictEqual(
      createdOrderStatusDeserialized.id,
      goodUpdateDeserialized.id,
    )
  })

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, orderStatusAdmin.username))
  })
})
