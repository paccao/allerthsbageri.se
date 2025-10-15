import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import type { CreateProductBody } from './product.schemas.ts'

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

  test.only('products can be created', async (t: TestContext) => {
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

    //todo: Fix product response. It should not return status 400 with the following error:
    // "Error: body/pickupOccasionId Invalid input: expected number, received undefined"

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

    // Todo: test what happens when you pass different values of maxPerCustomer in CREATE
  })

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, productAdmin.username))
  })
})
