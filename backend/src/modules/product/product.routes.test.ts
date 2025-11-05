import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import type {
  CreateProductBody,
  Product,
  UpdateProductBody,
} from './product.schemas.ts'

const app = await startApp()
const { createAdminUser } = getTestingUtils(app)

suite('product routes', () => {
  const productAdmin = {
    username: 'productAdmin',
    name: 'productAdmin',
    password: '123456',
  }

  let cookie: string

  before(async () => {
    cookie = await createAdminUser(productAdmin)
  })

  test('can get products', async (t: TestContext) => {
    const getResponse1 = await app.inject({
      method: 'GET',
      url: `/api/products/${1337}`,
      headers: { cookie },
    })

    t.assert.strictEqual(getResponse1.statusCode, 404)

    const productDetail = {
      name: 'testkaka',
      description:
        'En kaka gjord på surdeg med konsistensen av en kladdkaka och test',
      image: 'https://allerthsbageri.se/static/bild123',
      vatPercentage: 16,
    }

    const productDetailResponse = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetail,
        headers: { cookie },
      })
      .then((res) => res.json())

    const pickup = {
      name: 'Allerths bageri',
      location: 'Bröd bakat med kärlek',
      bookingStart: new Date('2025-11-23T08:00:00.000Z'),
      bookingEnd: new Date('2025-11-28T17:00:00.000Z'),
      pickupStart: new Date('2025-11-29T09:00:00.000Z'),
      pickupEnd: new Date('2025-11-29T16:30:00.000Z'),
    }

    const pickupResponse = await app
      .inject({
        method: 'POST',
        url: '/api/pickups/',
        body: pickup,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product: CreateProductBody = {
      stock: 13,
      price: 4444,
      maxPerCustomer: 2,
      pickupOccasionId: pickupResponse.id,
      productDetailsId: productDetailResponse.id,
    }

    const createdProduct = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product,
        headers: { cookie },
      })
      .then((res) => res.json())

    const getProductById = await app.inject({
      method: 'GET',
      url: `/api/products/${createdProduct.id}`,
      headers: { cookie },
    })

    t.assert.strictEqual(getProductById.statusCode, 200)
    t.assert.strictEqual(getProductById.json().price, product.price)

    const product2: CreateProductBody = {
      stock: 13,
      price: 4444,
      maxPerCustomer: 2,
      pickupOccasionId: pickupResponse.id,
      productDetailsId: productDetailResponse.id,
    }

    const createdProduct2 = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: product2,
        headers: { cookie },
      })
      .then((res) => res.json())

    const listProducts = await app.inject({
      method: 'GET',
      url: '/api/products/',
      headers: { cookie },
    })

    const listDeserialized = listProducts.json() as Array<Product>

    t.assert.strictEqual(getProductById.statusCode, 200)
    t.assert.strictEqual(
      listDeserialized.some((item) => item.stock === createdProduct2.stock),
      true,
    )
  })

  test('products can be created', async (t: TestContext) => {
    const product: CreateProductBody = {
      stock: 25,
      price: 7700,
      maxPerCustomer: 1,
      pickupOccasionId: 99999,
      productDetailsId: 99999,
    }

    const badProductResponse = await app.inject({
      method: 'POST',
      url: '/api/products/',
      body: product,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badProductResponse.statusCode,
      400,
      'should be a bad request when either a pickup occasion or product detail in the product request body does not exist',
    )

    const productDetail = {
      name: 'kladdkakekaka',
      description: 'En kaka gjord på surdeg med konsistensen av en kladdkaka',
      image: null,
      vatPercentage: 13,
    }

    const productDetailResponse = await app.inject({
      method: 'POST',
      url: '/api/product-details/',
      body: productDetail,
      headers: { cookie },
    })

    t.assert.strictEqual(productDetailResponse.statusCode, 201)

    const pickup = {
      name: 'Särlatorgets marknad',
      location:
        'Kakor, bröd, kex. Kom och hälsa på mig på särlatorgets marknad vetja!',
      bookingStart: new Date('2025-08-23T08:00:00.000Z'),
      bookingEnd: new Date('2025-08-28T17:00:00.000Z'),
      pickupStart: new Date('2025-08-29T09:00:00.000Z'),
      pickupEnd: new Date('2025-08-29T16:30:00.000Z'),
    }

    const pickupResponse = await app.inject({
      method: 'POST',
      url: '/api/pickups/',
      body: pickup,
      headers: { cookie },
    })

    t.assert.strictEqual(pickupResponse.statusCode, 201)

    const goodProduct: CreateProductBody = {
      stock: 13,
      price: 9000,
      maxPerCustomer: 2,
      pickupOccasionId: pickupResponse.json().id,
      productDetailsId: productDetailResponse.json().id,
    }

    const goodProductResponse = await app.inject({
      method: 'POST',
      url: '/api/products/',
      body: goodProduct,
      headers: { cookie },
    })

    t.assert.strictEqual(goodProductResponse.statusCode, 201)
    t.assert.strictEqual(goodProductResponse.json().price, goodProduct.price)

    let productWithoutMaxPerCustomer: CreateProductBody = {
      stock: 13,
      price: 9000,
      pickupOccasionId: pickupResponse.json().id,
      productDetailsId: productDetailResponse.json().id,
    }

    const res1 = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: productWithoutMaxPerCustomer,
        headers: { cookie },
      })
      .then((res) => res.json())

    t.assert.strictEqual(
      res1.maxPerCustomer,
      null,
      'maxPerCustomer returns null even though its undefined',
    )

    const productWithUndefinedMaxPerCustomer: CreateProductBody = {
      stock: 13,
      price: 9000,
      maxPerCustomer: undefined,
      pickupOccasionId: pickupResponse.json().id,
      productDetailsId: productDetailResponse.json().id,
    }

    const res2 = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: productWithUndefinedMaxPerCustomer,
        headers: { cookie },
      })
      .then((res) => res.json())

    t.assert.strictEqual(
      res2.maxPerCustomer,
      null,
      'maxPerCustomer returns null even though its undefined',
    )

    const productWithNullMaxPerCustomer: CreateProductBody = {
      stock: 13,
      price: 9000,
      maxPerCustomer: null,
      pickupOccasionId: pickupResponse.json().id,
      productDetailsId: productDetailResponse.json().id,
    }

    const res3 = await app
      .inject({
        method: 'POST',
        url: '/api/products/',
        body: productWithNullMaxPerCustomer,
        headers: { cookie },
      })
      .then((res) => res.json())

    t.assert.strictEqual(
      res3.maxPerCustomer,
      null,
      'maxPerCustomer returns null even though its undefined',
    )
  })

  test('products can be updated', async (t: TestContext) => {
    const productDetail = {
      name: 'testkaka',
      description:
        'En kaka gjord på surdeg med konsistensen av en kladdkaka och test',
      image: 'https://allerthsbageri.se/static/bild123',
      vatPercentage: 16,
    }

    const productDetailResponse = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetail,
        headers: { cookie },
      })
      .then((res) => res.json())

    const pickup = {
      name: 'Allerths bageri',
      location: 'Bröd bakat med kärlek',
      bookingStart: new Date('2025-11-23T08:00:00.000Z'),
      bookingEnd: new Date('2025-11-28T17:00:00.000Z'),
      pickupStart: new Date('2025-11-29T09:00:00.000Z'),
      pickupEnd: new Date('2025-11-29T16:30:00.000Z'),
    }

    const pickupResponse = await app
      .inject({
        method: 'POST',
        url: '/api/pickups/',
        body: pickup,
        headers: { cookie },
      })
      .then((res) => res.json())

    const product: CreateProductBody = {
      stock: 13,
      price: 9000,
      maxPerCustomer: 2,
      pickupOccasionId: pickupResponse.id,
      productDetailsId: productDetailResponse.id,
    }

    const productResponse = await app.inject({
      method: 'POST',
      url: '/api/products/',
      body: product,
      headers: { cookie },
    })

    const createdProduct = productResponse.json()

    t.assert.strictEqual(productResponse.statusCode, 201)

    const badProductUpdate1 = {
      stock: 909090,
      price: '9000',
      maxPerCustomer: 6,
      pickupOccasionId: pickupResponse.id,
      productDetailsId: productDetailResponse.id,
    }

    const badUpdate1 = await app.inject({
      method: 'PATCH',
      url: `/api/products/${createdProduct.id}`,
      body: badProductUpdate1,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badUpdate1.statusCode,
      400,
      'Should return status 400 when an invalid type is sent',
    )

    const badProductUpdate2: UpdateProductBody = {
      stock: 26,
      price: 4800,
      maxPerCustomer: 4,
      pickupOccasionId: 9090909,
      productDetailsId: productDetailResponse.id,
    }

    const badUpdate2 = await app.inject({
      method: 'PATCH',
      url: `/api/products/${createdProduct.id}`,
      body: badProductUpdate2,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badUpdate2.statusCode,
      400,
      'Should return status 400 when a non-existent pickupOccasionId is sent',
    )

    const badProductUpdate3: UpdateProductBody = {
      stock: 264,
      productDetailsId: 444444444,
    }

    const badUpdate3 = await app.inject({
      method: 'PATCH',
      url: `/api/products/${createdProduct.id}`,
      body: badProductUpdate3,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badUpdate3.statusCode,
      400,
      'Should return status 400 when a non-existent productDetailsId is sent',
    )

    const badProductUpdate4: UpdateProductBody = {}

    const badUpdate4 = await app.inject({
      method: 'PATCH',
      url: `/api/products/${createdProduct.id}`,
      body: badProductUpdate4,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badUpdate4.statusCode,
      400,
      'Should return status 400 when no parameters in the body is sent',
    )

    const badProductUpdate5: UpdateProductBody = {
      stock: 700,
      pickupOccasionId: pickupResponse.id,
    }

    const badUpdate5 = await app.inject({
      method: 'PATCH',
      url: `/api/products/`,
      body: badProductUpdate5,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badUpdate5.statusCode,
      400,
      'Should return status 400 when no id parameter is sent in the url',
    )

    const badProductUpdate6: UpdateProductBody = {
      stock: 700,
      pickupOccasionId: pickupResponse.id,
    }

    const badUpdate6 = await app.inject({
      method: 'PATCH',
      url: `/api/products/${99998}`,
      body: badProductUpdate6,
      headers: { cookie },
    })

    t.assert.strictEqual(
      badUpdate6.statusCode,
      404,
      'Should return status 404 when no product with the provided params ID exists',
    )

    const goodUpdate: UpdateProductBody = {
      stock: 140,
      price: 9400,
    }

    const goodUpdateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/products/${createdProduct.id}`,
      body: goodUpdate,
      headers: { cookie },
    })

    t.assert.strictEqual(
      goodUpdateResponse.statusCode,
      200,
      'Should update with proper url params and body',
    )
    t.assert.strictEqual(goodUpdateResponse.json().stock, goodUpdate.stock)
  })

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, productAdmin.username))
  })
})
