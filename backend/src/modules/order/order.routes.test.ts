import { before, suite, test, type TestContext } from 'node:test'
import z from 'zod'

import { getTestingUtils, startTestApp } from '#utils/testing-utils.ts'
import type { CreateOrderBody } from './order.schemas.ts'
import type { CreateProductBody, Product } from '../product/product.schemas.ts'
import type { GetProductDetails } from '../product-details/product-details.schemas.ts'
import type { GetPickupOccasion } from '../pickup-occasion/pickup-occasion.schemas.ts'

const app = await startTestApp()

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

  const customer2 = {
    name: 'Angela Lawson',
    phone: '+46704555555',
  }

  let cookie: string

  before(async () => {
    cookie = await createAdminUser(orderAdmin)
  })

  test('should return 400 when the specified statusId is not found', async (t: TestContext) => {
    const order: CreateOrderBody = {
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
    const order: CreateOrderBody = {
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
    const order: CreateOrderBody = {
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

  test('should only be possible to order from a pickup occasion between orderStart and orderEnd', async (t: TestContext) => {
    // attempt creating order before orderStart
    const pickupOccasion1 = {
      name: 'Särlatorgets marknad',
      location:
        'Kakor, bröd, kex. Kom och hälsa på mig på särlatorgets marknad vetja!',
      orderStart: new Date(Date.now() + UNIX_HOUR_MS),
      orderEnd: new Date(Date.now() + UNIX_HOUR_MS * 2),
      pickupStart: new Date(Date.now() + UNIX_HOUR_MS * 3),
      pickupEnd: new Date(Date.now() + UNIX_HOUR_MS * 4),
    }

    const createdPickupResponse1: GetPickupOccasion = await app
      .inject({
        method: 'POST',
        url: '/api/pickups/',
        body: pickupOccasion1,
        headers: { cookie },
      })
      .then((res) => res.json())

    const productDetails: GetProductDetails = {
      id: 1,
      name: 'Kärleksbröd med Emmer',
      description: 'En limpa perfekt som en gåva på alla hjärtans dag',
      image: 'https://allerthsbageri.se/love',
      vatPercentage: 10,
    }

    const productDetailsResponse = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetails,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product1: CreateProductBody = {
      stock: 5,
      price: 2000,
      maxPerCustomer: 2,
      pickupOccasionId: createdPickupResponse1.id,
      productDetailsId: productDetailsResponse.id,
    }

    const productResponse1 = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product1,
        headers: { cookie },
      })
      .then((res) => res.json())

    // Date time is wrong here, check pickup occasion above
    const badOrder1: CreateOrderBody = {
      customer,
      pickupOccasionId: createdPickupResponse1.id,
      orderItems: [
        {
          count: 2,
          productId: productResponse1.id,
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
      'orders can not be created before the orderStart of a pickup occasion',
    )

    // attempt creating order after orderEnd
    const pickupOccasion2 = {
      name: 'Särlatorgets marknad',
      location:
        'Kakor, bröd, kex. Kom och hälsa på mig på särlatorgets marknad vetja!',
      orderStart: new Date(Date.now() - UNIX_HOUR_MS * 2),
      orderEnd: new Date(Date.now() - UNIX_HOUR_MS),
      pickupStart: new Date(Date.now() + UNIX_HOUR_MS * 3),
      pickupEnd: new Date(Date.now() + UNIX_HOUR_MS * 4),
    }

    const createdPickupResponse2: GetPickupOccasion = await app
      .inject({
        method: 'POST',
        url: '/api/pickups/',
        body: pickupOccasion2,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product2: CreateProductBody = {
      stock: 5,
      price: 2000,
      maxPerCustomer: 2,
      pickupOccasionId: createdPickupResponse1.id,
      productDetailsId: productDetailsResponse.id,
    }

    const productResponse2 = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product2,
        headers: { cookie },
      })
      .then((res) => res.json())

    // Date time is wrong here, check pickup occasion above
    const badOrder2: CreateOrderBody = {
      customer,
      pickupOccasionId: createdPickupResponse2.id,
      orderItems: [
        {
          count: 2,
          productId: productResponse2.id,
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
      'orders can not be created after the orderEnd of a pickup occasion',
    )
  })

  test('should be possible to create an order when order item count <= maxPerCustomer', async (t: TestContext) => {
    const pickupOccasion = {
      name: 'Särlatorgets marknad',
      location:
        'Kakor, bröd, kex. Kom och hälsa på mig på särlatorgets marknad vetja!',
      orderStart: new Date(Date.now() - UNIX_HOUR_MS * 2),
      orderEnd: new Date(Date.now() + UNIX_HOUR_MS),
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

    const productDetails1: GetProductDetails = {
      id: 1,
      name: 'Blåbärssoppa',
      description: 'a soup of blueberries',
      image: 'https://allerthsbageri.se/image1',
      vatPercentage: 14,
    }

    const firstProductDetailsResponse = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetails1,
        headers: { cookie },
      })
      .then((res) => res.json())

    const productDetaisl2: GetProductDetails = {
      id: 1,
      name: 'Surdegsbröd',
      description: 'Bread made of sourdough',
      image: 'https://allerthsbageri.se/image2',
      vatPercentage: 16,
    }

    const secondProductDetailsResponse = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetaisl2,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product1: CreateProductBody = {
      stock: 5,
      price: 2000,
      maxPerCustomer: 2,
      pickupOccasionId: createdPickupResponse.id,
      productDetailsId: firstProductDetailsResponse.id,
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
      productDetailsId: secondProductDetailsResponse.id,
    }

    const secondProductResponse = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product2,
        headers: { cookie },
      })
      .then((res) => res.json())

    const badOrder: CreateOrderBody = {
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
    const badOrder1: CreateOrderBody = {
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
    const badOrder2: CreateOrderBody = {
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
    const badOrder3: CreateOrderBody = {
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

    const goodOrder: CreateOrderBody = {
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

    t.assert.strictEqual(
      response.statusCode,
      201,
      'can create an order when the body is valid and neither stock has run out or maxPerCustomer is exceeded',
    )
    t.assert.strictEqual(
      z.uuidv4().safeParse(deserialized.id).success,
      true,
      'order id should be a valid UUID v4',
    )
  })

  test('can handle multiple consecutive orders', async (t: TestContext) => {
    const pickupOccasion = {
      name: 'Hässleholmens marknad',
      location: 'Hässleholms torget',
      orderStart: new Date(Date.now() - UNIX_HOUR_MS * 2),
      orderEnd: new Date(Date.now() + UNIX_HOUR_MS),
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

    const productDetails1: GetProductDetails = {
      id: 1,
      name: 'Surdegsbröd1',
      description: 'Bread made of sourdough',
      image: 'https://allerthsbageri.se/image55',
      vatPercentage: 16,
    }

    const productDetailsResponse1 = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetails1,
        headers: { cookie },
      })
      .then((res) => res.json())

    const productDetails2: GetProductDetails = {
      id: 1,
      name: 'Surdegsbröd2',
      description: 'Bread made of sourdough',
      image: 'https://allerthsbageri.se/image55',
      vatPercentage: 16,
    }

    const productDetailsResponse2 = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetails2,
        headers: { cookie },
      })
      .then((res) => res.json())

    const productDetails3: GetProductDetails = {
      id: 1,
      name: 'Surdegsbröd3',
      description: 'Bread made of sourdough',
      image: 'https://allerthsbageri.se/image55',
      vatPercentage: 16,
    }

    const productDetailsResponse3 = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetails3,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product1: CreateProductBody = {
      stock: 4,
      price: 6600,
      maxPerCustomer: null,
      pickupOccasionId: createdPickupResponse.id,
      productDetailsId: productDetailsResponse1.id,
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
      productDetailsId: productDetailsResponse2.id,
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
      maxPerCustomer: 2,
      pickupOccasionId: createdPickupResponse.id,
      productDetailsId: productDetailsResponse3.id,
    }

    const productResponse3 = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product3,
        headers: { cookie },
      })
      .then((res) => res.json())

    const goodOrder: CreateOrderBody = {
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

    t.assert.strictEqual(
      response.statusCode,
      201,
      'customer can create an order',
    )

    const afterCreationProduct1: Product = (
      await app.inject({
        method: 'GET',
        url: `/api/products/${productResponse1.id}`,
        headers: { cookie },
      })
    ).json()

    t.assert.strictEqual(
      afterCreationProduct1?.stock,
      product1.stock - goodOrder.orderItems[0]!.count,
      'product stock should be updated after successful order',
    )

    const afterCreationProduct2: Product = (
      await app.inject({
        method: 'GET',
        url: `/api/products/${productResponse2.id}`,
        headers: { cookie },
      })
    ).json()

    t.assert.strictEqual(
      afterCreationProduct2?.stock,
      product2.stock - goodOrder.orderItems[1]!.count,
      'product stock should be updated after successful order',
    )

    const afterCreationProduct3: Product = (
      await app.inject({
        method: 'GET',
        url: `/api/products/${productResponse3.id}`,
        headers: { cookie },
      })
    ).json()

    t.assert.strictEqual(
      afterCreationProduct3?.stock,
      product3.stock - goodOrder.orderItems[2]!.count,
      'product stock should be updated after successful order, even when maxPerCustomer is set',
    )

    const goodOrder2: CreateOrderBody = {
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

    const totalOrderOfProduct3 =
      goodOrder.orderItems[2]!.count + goodOrder2.orderItems[2]!.count

    t.assert.strictEqual(
      totalOrderOfProduct3 <= product3.maxPerCustomer!,
      true,
      'second consecutive order for the same customer does not exceed maxPerCustomer',
    )

    const afterOrder2Product1: Product = (
      await app.inject({
        method: 'GET',
        url: `/api/products/${productResponse1.id}`,
        headers: { cookie },
      })
    ).json()

    t.assert.strictEqual(
      afterOrder2Product1?.stock,
      product1.stock -
        goodOrder.orderItems[0]!.count -
        goodOrder2.orderItems[0]!.count,
      'product stock should be updated after 2 successful orders',
    )

    const afterOrder2Product2: Product = (
      await app.inject({
        method: 'GET',
        url: `/api/products/${productResponse2.id}`,
        headers: { cookie },
      })
    ).json()

    t.assert.strictEqual(
      afterOrder2Product2?.stock,
      product2.stock -
        goodOrder.orderItems[1]!.count -
        goodOrder2.orderItems[1]!.count,
      'product stock should be updated after 2 successful orders',
    )

    const afterOrder2Product3: Product = (
      await app.inject({
        method: 'GET',
        url: `/api/products/${productResponse3.id}`,
        headers: { cookie },
      })
    ).json()

    t.assert.strictEqual(
      afterOrder2Product3?.stock,
      product3.stock -
        goodOrder.orderItems[2]!.count -
        goodOrder2.orderItems[2]!.count,
      'product stock should be updated after 2 successful orders, even when maxPerCustomer is set',
    )

    const badOrderCustomer1: CreateOrderBody = {
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
          count: 1, // this will exceed maxPerCustomer
          productId: productResponse3.id,
        },
      ],
    }

    const badResponseCustomer1 = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: badOrderCustomer1,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badResponseCustomer1.statusCode,
      400,
      'it should not be possible to exceed maxPerCustomer across multiple orders, despite the request body being type-valid',
    )

    const goodOrderAfterMaxPerCustomerExceeded: CreateOrderBody = {
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
      ],
    }

    const goodResponseAfterMaxPerCustomerExceeded = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: goodOrderAfterMaxPerCustomerExceeded,
      headers: { cookie },
    })

    t.assert.strictEqual(
      goodResponseAfterMaxPerCustomerExceeded.statusCode,
      201,
      'customer1 can create an order if they order other products than the one where they reached maxPerCustomer',
    )

    const goodOrderCustomer2: CreateOrderBody = {
      customer: customer2,
      pickupOccasionId: createdPickupResponse.id,
      orderItems: [
        {
          count: 1,
          productId: productResponse3.id,
        },
      ],
    }

    const goodResponseCustomer2 = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: goodOrderCustomer2,
      headers: { cookie },
    })

    t.assert.strictEqual(
      goodResponseCustomer2.statusCode,
      201,
      'customer2 can order productA even if another customer has reached maxPerCustomer for it, as long as productA remains in stock',
    )

    const badOrderCustomer2: CreateOrderBody = {
      customer: customer2,
      pickupOccasionId: createdPickupResponse.id,
      orderItems: [
        {
          count: 2, // Exceed stock size
          productId: productResponse1.id,
        },
      ],
    }

    const badResponseCustomer2 = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: badOrderCustomer2,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badResponseCustomer2.statusCode,
      400,
      'customer2 can not order product if it has run out of stock size',
    )

    const goodOrder2Customer2: CreateOrderBody = {
      customer: customer2,
      pickupOccasionId: createdPickupResponse.id,
      orderItems: [
        {
          count: 2,
          productId: productResponse2.id,
        },
        {
          count: 2,
          productId: productResponse2.id,
        },
      ],
    }

    const goodResponse2Customer2 = await app.inject({
      method: 'POST',
      url: '/api/orders/',
      body: goodOrder2Customer2,
      headers: { cookie },
    })

    t.assert.strictEqual(
      goodResponse2Customer2.statusCode,
      201,
      'can order with multiple orderItems of the same ID',
    )
  })
})
