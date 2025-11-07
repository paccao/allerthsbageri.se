import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import { createOrderBodySchema } from './order.schemas.ts'
import z from 'zod'

const app = await startApp()
const { createAdminUser } = getTestingUtils(app)

suite.only('order routes', () => {
  const orderAdmin = {
    username: 'orderAdmin',
    name: 'orderAdmin',
    password: '123456',
  }

  const _orderBody = createOrderBodySchema.extend({
    customer: {
      phone: z.string(), // e164number
    },
  })
  type _CreateOrderBody = z.infer<typeof _orderBody>

  let cookie: string

  before(async () => {
    cookie = await createAdminUser(orderAdmin)
  })

  test('should return 404 when specified productId is not found', async (t: TestContext) => {
    const order: _CreateOrderBody = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: 1,
      statusId: 1,
      orderItems: [
        {
          count: 2,
          productId: 99999999,
        },
        {
          count: 1,
          productId: 776767677,
        },
      ],
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: order,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 404)
  })

  test('should not be possible to pass incorrect orderItems', async (t: TestContext) => {
    const order = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: 1,
      statusId: 1,
      orderItems: [
        {
          count: 2,
          productId: 'hello there',
        },
        {
          count: 'hello',
          productId: 2,
        },
      ],
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: order,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 400)
  })

  test('should not be possible to pass incorrect pickupOccasion', async (t: TestContext) => {
    const order = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasion: 'test_wrong',
      statusId: 1,
      orderItems: [
        {
          count: 2,
          productId: 1,
        },
        {
          count: 1,
          productId: 2,
        },
      ],
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: order,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 400)
  })

  test('should return 404 when specified pickupOccasionId is not found', async (t: TestContext) => {
    const order = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasion: 493940394,
      statusId: 1,
      orderItems: [
        {
          count: 2,
          productId: 1,
        },
        {
          count: 1,
          productId: 2,
        },
      ],
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: order,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 404)
  })

  test('should not be possible to pass incorrect customer', async (t: TestContext) => {
    const order: _CreateOrderBody = {
      customer: {
        name: 'John Doe',
        phone: '-',
      },
      pickupOccasionId: 1,
      statusId: 1,
      orderItems: [
        {
          count: 2,
          productId: 1,
        },
        {
          count: 1,
          productId: 2,
        },
      ],
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: order,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 400)
  })

  test('should be possible to create a customer order', async (t: TestContext) => {
    const order: _CreateOrderBody = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: 1,
      statusId: 1,
      orderItems: [
        {
          count: 2,
          productId: 1,
        },
        {
          count: 1,
          productId: 2,
        },
      ],
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: order,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 201)
    t.assert.strictEqual(typeof response.json().orderId, 'string')
  })

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, orderAdmin.username))
  })
})
