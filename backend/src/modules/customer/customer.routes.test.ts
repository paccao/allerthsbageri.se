import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'

const app = await startApp()

async function createAdminUser(body: {
  username: string
  name: string
  password: string
}) {
  const response = await app.inject({
    method: 'POST',
    body,
  })

  return response.headers['set-cookie'] as string
}

suite('customer routes', () => {
  const admin1 = {
    username: 'customer-admin1',
    name: 'Admin1',
    password: '123456',
  }

  let cookieHeader: string

  before(async () => {
    cookieHeader = await createAdminUser(admin1)
  })

  test('should be possible to create a customer', async (t: TestContext) => {
    // TODO: test creating a customer
  })

  after(async () => {
    await db.delete(userTable).where(eq(userTable.username, admin1.username))

    // TODO: delete customers used in this test suite, directly via the DB
    // TODO: add an endpoint for deleting a customer
    // TODO: test that the endpoint for deleting a customer works as expected
  })
})
