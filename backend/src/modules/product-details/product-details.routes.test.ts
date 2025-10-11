import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'

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

  after(async () => {
    await db
      .delete(userTable)
      .where(eq(userTable.username, productDetailsAdmin.username))
  })
})
