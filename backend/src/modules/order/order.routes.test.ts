import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'
import z from 'zod'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import { createOrderBodySchema } from './order.schemas.ts'
import type { CreateProductBody } from '../product/product.schemas.ts'
import type { GetProductDetail } from '../product-details/product-details.schemas.ts'
import type { GetPickupOccasion } from '../pickup-occasion/pickup-occasion.schemas.ts'
import { getProductById } from '../product/product.service.ts'

const app = await startApp()
const { createAdminUser } = getTestingUtils(app)

const UNIX_HOUR_MS = 3600000 // 3600000  is 1 hour in unix time in milliseconds

suite('order routes', () => {
  const orderAdmin = {
    username: 'orderAdmin',
    name: 'orderAdmin',
    password: '123456',
  }

  const customer = {
    name: 'John Doe',
    phone: '+46703666666',
  }

  // NOTE: We have to extend the schema here because the type didnt recognize numbers as strings
  // even though that is what we are supposed to send in the request for creating customers
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

  test('should return 400 when the specified statusId is not found', async (t: TestContext) => {
    const order: _CreateOrderBody = {
      customer,
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

  test('should return 400 when any of the specified productId is not found', async (t: TestContext) => {
    const order: _CreateOrderBody = {
      customer,
      pickupOccasionId: 1,
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
      customer,
      pickupOccasionId: 1,
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
      customer,
      pickupOccasionId: 1,
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
      customer,
      pickupOccasion: 'test_wrong',
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
      customer,
      pickupOccasionId: 493940394,
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

  test('should be possible to create an order when order item count <= maxPerCustomer', async (t: TestContext) => {
    const pickupOccasion = {
      name: 'Särlatorgets marknad',
      location:
        'Kakor, bröd, kex. Kom och hälsa på mig på särlatorgets marknad vetja!',
      bookingStart: new Date(Date.now() - UNIX_HOUR_MS * 2),
      bookingEnd: new Date(Date.now() + UNIX_HOUR_MS),
      pickupStart: new Date(Date.now() + UNIX_HOUR_MS * 2),
      pickupEnd: new Date(Date.now() + UNIX_HOUR_MS * 4),
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

    const product1: CreateProductBody = {
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

    const product2: CreateProductBody = {
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
      customer,
      pickupOccasionId: createdPickupResponse.id + 999, // pickup occasion ID is wrong here
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
      customer,
      pickupOccasionId: createdPickupResponse.id,
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
      customer,
      pickupOccasionId: createdPickupResponse.id,
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

    // At least one order item must be provided
    const badOrder3: _CreateOrderBody = {
      customer,
      pickupOccasionId: createdPickupResponse.id,
      orderItems: [],
    }

    const badResponse3 = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: badOrder3,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badResponse3.statusCode,
      400,
      'should return 400 when no order items are provided',
    )

    const goodOrder: _CreateOrderBody = {
      customer,
      pickupOccasionId: createdPickupResponse.id,
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

    t.assert.strictEqual(response.statusCode, 201)
    t.assert.strictEqual(
      z.uuidv4().safeParse(deserialized.id).success,
      true,
      'order id should be a valid UUID v4',
    )
  })

  test('can order when order item count is <= stock, also when maxPerCustomer is null', async (t: TestContext) => {
    const pickupOccasion = {
      name: 'Hässleholmens marknad',
      location: 'Hässleholms torget',
      bookingStart: new Date(Date.now() - UNIX_HOUR_MS * 2),
      bookingEnd: new Date(Date.now() + UNIX_HOUR_MS),
      pickupStart: new Date(Date.now() + UNIX_HOUR_MS * 2),
      pickupEnd: new Date(Date.now() + UNIX_HOUR_MS * 4),
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
      name: 'Surdegsbröd1',
      description: 'Bread made of sourdough',
      image: 'https://allerthsbageri.se/image55',
      vatPercentage: 16,
    }

    const productDetailResponse1 = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetail1,
        headers: { cookie },
      })
      .then((res) => res.json())

    const productDetail2: GetProductDetail = {
      id: 1,
      name: 'Surdegsbröd2',
      description: 'Bread made of sourdough',
      image: 'https://allerthsbageri.se/image55',
      vatPercentage: 16,
    }

    const productDetailResponse2 = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetail2,
        headers: { cookie },
      })
      .then((res) => res.json())

    const productDetail3: GetProductDetail = {
      id: 1,
      name: 'Surdegsbröd3',
      description: 'Bread made of sourdough',
      image: 'https://allerthsbageri.se/image55',
      vatPercentage: 16,
    }

    const productDetailResponse3 = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetail3,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product1: CreateProductBody = {
      stock: 4,
      price: 6600,
      maxPerCustomer: null,
      pickupOccasionId: createdPickupResponse.id,
      productDetailsId: productDetailResponse1.id,
    }

    const productResponse1 = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product1,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product2: CreateProductBody = {
      stock: 10,
      price: 6600,
      maxPerCustomer: null,
      pickupOccasionId: createdPickupResponse.id,
      productDetailsId: productDetailResponse2.id,
    }

    const productResponse2 = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product2,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product3: CreateProductBody = {
      stock: 10,
      price: 6600,
      maxPerCustomer: 1,
      pickupOccasionId: createdPickupResponse.id,
      productDetailsId: productDetailResponse3.id,
    }

    const productResponse3 = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product3,
        headers: { cookie },
      })
      .then((res) => res.json())

    const goodOrder: _CreateOrderBody = {
      customer,
      pickupOccasionId: createdPickupResponse.id,
      orderItems: [
        {
          count: 2,
          productId: productResponse1.id,
        },
        {
          count: 5,
          productId: productResponse2.id,
        },
        {
          count: 1,
          productId: productResponse3.id,
        },
      ],
    }

    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: goodOrder,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 201)

    const afterCreationProduct1 = await getProductById(productResponse1.id)
    t.assert.strictEqual(
      afterCreationProduct1?.stock,
      (product1.stock -= goodOrder.orderItems[0]!?.count),
      'product stock should be updated after successful order',
    )

    const afterCreationProduct2 = await getProductById(productResponse2.id)
    t.assert.strictEqual(
      afterCreationProduct2?.stock,
      (product2.stock -= goodOrder.orderItems[1]!?.count),
      'product stock should be updated after successful order',
    )

    const afterCreationProduct3 = await getProductById(productResponse3.id)
    t.assert.strictEqual(
      afterCreationProduct3?.stock,
      (product3.stock -= goodOrder.orderItems[2]!?.count),
      'product stock should be updated after successful order, even when maxPerCustomer is set',
    )

    const goodOrder2: _CreateOrderBody = {
      customer,
      pickupOccasionId: createdPickupResponse.id,
      orderItems: [
        {
          count: 1,
          productId: productResponse1.id,
        },
        {
          count: 1,
          productId: productResponse2.id,
        },
        {
          count: 1,
          productId: productResponse3.id,
        },
      ],
    }

    const response2 = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: goodOrder2,
      headers: { cookie },
    })

    t.assert.strictEqual(
      response2.statusCode,
      201,
      'it should be possible to create another order for the same customer and pickup occasion as long as maxPerCustomer is not reached for any order item',
    )

    // TODO: create another order for the same customer
    // Verify that maxPerCustomer is correctly validated across multiple orders

    // TODO: rename this test case to "test multiple consecutive orders" or similar

    // TODO: Add detailed error messages ("test case descriptions") to when we assert order responses. This allows us to reduce repetition while still keeping separate test cases that build on each other.

    // TODO: create another customer and verify that they can still make orders even when other customers have reached their maxPerCustomer limit in their orders

    // TODO: create a successful order for customer2

    // TODO: create a failing order for customer2 even though their maxPerCustomer is not yet reached, because the product stock for some product they try to order is out.
  })

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, orderAdmin.username))
  })
})
