import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'
import z from 'zod'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import { createOrderBodySchema } from './order.schemas.ts'
import type { Product } from '../product/product.schemas.ts'
import type { GetProductDetail } from '../product-details/product-details.schemas.ts'
import type { GetPickupOccasion } from '../pickup-occasion/pickup-occasion.schemas.ts'

const app = await startApp()
const { createAdminUser } = getTestingUtils(app)

suite.only('order routes', () => {
  const orderAdmin = {
    username: 'orderAdmin',
    name: 'orderAdmin',
    password: '123456',
  }

  // have to extend the schema here because the type didnt recognize numbers as strings even though that is what we are supposed to send in the request for creating customers
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

  // TODO: Fix status codes in all relevant tests
  // TODO: test that the default status id is used - unit test needed since we dont return status id?

  test('should return 400 when the specified statusId is not found', async (t: TestContext) => {
    const order: _CreateOrderBody = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: 1,
      statusId: 88889,
      orderItems: [
        {
          count: 2,
          productId: 1,
        },
        {
          count: 1,
          productId: 1,
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

  // TODO: test that two default status IDs cause an error

  test('should return 400 when any of the specified productId is not found', async (t: TestContext) => {
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
          productId: 1,
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

  test('should return 400 when incorrect orderItems was passed', async (t: TestContext) => {
    const incorrectOrder1 = {
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

    let response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: incorrectOrder1,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 400)

    const incorrectOrder2 = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: 1,
      statusId: 1,
      orderItems: {},
    }

    response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: incorrectOrder2,
      headers: { cookie },
    })

    t.assert.strictEqual(
      response.statusCode,
      400,
      'The orderItems should be an array of Orders (count, productId)',
    )
  })

  test('should return 400 when incorrect pickupOccasion was passed', async (t: TestContext) => {
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

  test('should return 400 when specified pickupOccasionId is not found', async (t: TestContext) => {
    const order = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: 493940394,
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

  test('should return 400 when incorrect customer was passed', async (t: TestContext) => {
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

  test('should be possible to create an order', async (t: TestContext) => {
    const pickupOccasion = {
      name: 'Särlatorgets marknad',
      location:
        'Kakor, bröd, kex. Kom och hälsa på mig på särlatorgets marknad vetja!',
      bookingStart: new Date('2025-08-23T08:00:00.000Z'),
      bookingEnd: new Date('2025-08-28T17:00:00.000Z'),
      pickupStart: new Date('2025-08-29T09:00:00.000Z'),
      pickupEnd: new Date('2025-08-29T15:30:00.000Z'),
    }

    const createdPickupResponse: GetPickupOccasion = await app
      .inject({
        method: 'POST',
        url: '/api/pickups/',
        body: pickupOccasion,
        headers: { cookie },
      })
      .then((res) => res.json())

    const productDetail1: GetProductDetail = {
      id: 1,
      name: 'Blåbärssoppa',
      description: 'a soup of blueberries',
      image: 'https://allerthsbageri.se/image1',
      vatPercentage: 14,
    }

    const firstProductDetailResponse = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetail1,
        headers: { cookie },
      })
      .then((res) => res.json())

    const productDetail2: GetProductDetail = {
      id: 1,
      name: 'Surdegsbröd',
      description: 'Bread made of sourdough',
      image: 'https://allerthsbageri.se/image2',
      vatPercentage: 16,
    }

    const secondProductDetailResponse = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetail2,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product1: Product = {
      id: 1,
      stock: 5,
      price: 2000,
      maxPerCustomer: 2,
      pickupOccasionId: createdPickupResponse.id,
      productDetailsId: firstProductDetailResponse.id,
    }

    const firstProductResponse = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product1,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product2: Product = {
      id: 2,
      stock: 2,
      price: 6600,
      maxPerCustomer: 3,
      pickupOccasionId: createdPickupResponse.id,
      productDetailsId: secondProductDetailResponse.id,
    }

    const secondProductResponse = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product2,
        headers: { cookie },
      })
      .then((res) => res.json())

    const badOrder: _CreateOrderBody = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: createdPickupResponse.id + 999, // pickup occasion ID is wrong here
      statusId: 1,
      orderItems: [
        {
          count: 2,
          productId: firstProductResponse.id,
        },
        {
          count: 1,
          productId: secondProductResponse.id,
        },
      ],
    }

    // TODO: add tests without statusId to verify cases when defaultStatusId kicks in.
    // TODO: should we test the case when we multiple orderStatusId

    const badResponse = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: badOrder,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badResponse.statusCode,
      400,
      'should return 400 when any of the order items productIds are not from the specified pickup occasion',
    )

    // Too many orderItems of one kind (maxPerCustomer)
    const badOrder1: _CreateOrderBody = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: createdPickupResponse.id,
      statusId: 1,
      orderItems: [
        {
          count: 999, // count is greater than maxPerCustomer
          productId: firstProductResponse.id,
        },
        {
          count: 1,
          productId: secondProductResponse.id,
        },
      ],
    }

    const badResponse1 = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: badOrder1,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badResponse1.statusCode,
      400,
      'should return 400 when the order items count exceed maxPerCustomer',
    )

    // Too many orderItems of one kind (maxPerCustomer)
    const badOrder2: _CreateOrderBody = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: createdPickupResponse.id,
      statusId: 1,
      orderItems: [
        {
          count: 2,
          productId: firstProductResponse.id,
        },
        {
          count: 3, // count is greater than stock size
          productId: secondProductResponse.id,
        },
      ],
    }

    const badResponse2 = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: badOrder2,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badResponse2.statusCode,
      400,
      'should return 400 when the order items count exceed the stock, but not maxPerCustomer',
    )

    const goodOrder: _CreateOrderBody = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: createdPickupResponse.id,
      statusId: 1,
      orderItems: [
        {
          count: 2,
          productId: firstProductResponse.id,
        },
        {
          count: 1,
          productId: secondProductResponse.id,
        },
      ],
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: goodOrder,
      headers: { cookie },
    })

    const deserialized = response.json()

    t.assert.strictEqual(badResponse.statusCode, 201)
    t.assert.strictEqual(deserialized.orderId, 'string') // TODO: assert that orderId is an UUID
  })

  test('can order when maxPerCustomer is null item count is <= stock', async (t: TestContext) => {
    const pickupOccasion = {
      name: 'Hässleholmens marknad',
      location: 'Hässleholms torget',
      bookingStart: new Date('2025-04-23T08:00:00.000Z'),
      bookingEnd: new Date('2025-04-28T17:00:00.000Z'),
      pickupStart: new Date('2025-04-29T09:00:00.000Z'),
      pickupEnd: new Date('2025-04-29T15:30:00.000Z'),
    }

    const createdPickupResponse: GetPickupOccasion = await app
      .inject({
        method: 'POST',
        url: '/api/pickups/',
        body: pickupOccasion,
        headers: { cookie },
      })
      .then((res) => res.json())

    const productDetail: GetProductDetail = {
      id: 1,
      name: 'Surdegsbröd',
      description: 'Bread made of sourdough',
      image: 'https://allerthsbageri.se/image55',
      vatPercentage: 16,
    }

    const secondProductDetailResponse = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetail,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product: Product = {
      id: 2,
      stock: 2,
      price: 6600,
      maxPerCustomer: null,
      pickupOccasionId: createdPickupResponse.id,
      productDetailsId: secondProductDetailResponse.id,
    }

    const productResponse = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product,
        headers: { cookie },
      })
      .then((res) => res.json())

    const goodOrder: _CreateOrderBody = {
      customer: {
        name: 'John Doe',
        phone: '+46703666666',
      },
      pickupOccasionId: createdPickupResponse.id,
      statusId: 1,
      orderItems: [
        {
          count: 2,
          productId: productResponse.id,
        },
      ],
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: goodOrder,
      headers: { cookie },
    })

    // TODO: fix, should return 201
    t.assert.strictEqual(response.statusCode, 201)
  })

  // TODO: Test if products stock is updated after a create Order.
  // We dont know if drizzle&sqllite transactions support Promise.all(), some say the queries inside will just not execute.

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, orderAdmin.username))
  })
})
