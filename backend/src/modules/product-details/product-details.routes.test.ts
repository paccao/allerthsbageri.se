import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import type { GetProductDetail } from './product-details.schemas.ts'

const app = await startApp()
const { createAdminUser } = getTestingUtils(app)

suite('product details routes', () => {
  const productDetailsAdmin = {
    username: 'productDetailsAdmin',
    name: 'productDetailsAdmin',
    password: '123456',
  }

  let cookie: string

  before(async () => {
    cookie = await createAdminUser(productDetailsAdmin)
  })

  test('should be possible to create a product detail and retrieve it after', async (t: TestContext) => {
    const productDetail = {
      name: 'banankaka123',
      description: 'gjord på banan, surdeg och vaniljsocker',
      image: null,
      vatPercentage: 40,
    }
    const DESCRIPTION_LENGTH = 1000

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/product-details/',
      body: productDetail,
      headers: { cookie },
    })

    const createDeserialized = createResponse.json()

    t.assert.strictEqual(createResponse.statusCode, 201)
    t.assert.strictEqual(createDeserialized.name, productDetail.name)
    t.assert.strictEqual(
      createDeserialized.description.length <= DESCRIPTION_LENGTH,
      true,
    )

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/product-details/',
      headers: { cookie },
    })

    const getByIdResponse = await app
      .inject({
        method: 'GET',
        url: `/api/product-details/${createDeserialized.id}`,
        headers: { cookie },
      })
      .then((res) => res.json())

    const listDeserialized = listResponse.json() as Array<GetProductDetail>

    t.assert.strictEqual(listResponse.statusCode, 200)
    t.assert.strictEqual(createDeserialized.id, getByIdResponse.id)
    t.assert.strictEqual(
      listDeserialized.some((item) => item.name === productDetail.name),
      true,
    )
  })

  test('should only patch data that was sent', async (t: TestContext) => {
    const productDetail = {
      name: 'blåbärmuffin',
      description: 'Gjord på blåbär, surdeg och kärlek',
      image: null,
      vatPercentage: 40,
    }

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/product-details/',
      body: productDetail,
      headers: { cookie },
    })

    const createDeserialized = createResponse.json()

    t.assert.strictEqual(createResponse.statusCode, 201)

    const productDetail2 = {
      name: 'hallonmuffin',
      description: 'Gjord på hallon, surdeg och kärlek',
      image: 'hej',
      vatPercentage: 15,
    }

    const anotherCreatedProductDetail = await app
      .inject({
        method: 'POST',
        url: '/api/product-details/',
        body: productDetail2,
        headers: { cookie },
      })
      .then((res) => res.json())

    const patchDetails = {
      name: 'blåbärmuffin93428498',
      description: 'Gjord på blåbär, surdeg och armbåge',
      image: 'https://www.allerthsbageri.se/content/bild123',
      vatPercentage: 12,
    }

    const afterUpdate = await app.inject({
      method: 'PATCH',
      url: `/api/product-details/${createDeserialized.id}`,
      body: patchDetails,
      headers: { cookie },
    })

    const patchedDeserialized = afterUpdate.json()

    const getProductDetail2 = await app
      .inject({
        method: 'GET',
        url: `/api/product-details/${anotherCreatedProductDetail.id}`,
        headers: { cookie },
      })
      .then((res) => res.json())

    t.assert.strictEqual(anotherCreatedProductDetail.id, getProductDetail2.id)

    t.assert.strictEqual(afterUpdate.statusCode, 200)
    t.assert.strictEqual(
      createDeserialized.id,
      patchedDeserialized.id,
      'assert that id has not changed',
    )
    t.assert.notStrictEqual(
      {
        name: createDeserialized.name,
        description: createDeserialized.description,
        image: createDeserialized.image,
        vatPercentage: createDeserialized.vatPercentage,
      },
      {
        name: patchedDeserialized.name,
        description: patchedDeserialized.description,
        image: patchedDeserialized.image,
        vatPercentage: patchedDeserialized.vatPercentage,
      },
      'assert that the data changed',
    )
  })

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, productDetailsAdmin.username))
  })
})
