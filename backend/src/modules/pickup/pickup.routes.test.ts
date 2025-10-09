import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'

const app = await startApp()
const { createAdminUser } = getTestingUtils(app)

suite('pickup routes', () => {
  const admin4 = {
    username: 'admin4',
    name: 'Admin4',
    password: '123456',
  }

  const pickup = {
    id: 3,
    name: 'Särlatorgets marknad',
    description:
      'Kakor, bröd, kex. Kom och hälsa på mig på särlatorgets marknad vetja!',
    bookingStart: new Date('2025-08-23T08:00:00.000Z'),
    bookingEnd: new Date('2025-08-28T17:00:00.000Z'),
    pickupStart: new Date('2025-08-29T09:00:00.000Z'),
    pickupEnd: new Date('2025-08-29T15:30:00.000Z'),
  }

  const pickupUpdateId = 2
  const pickupUpdate = {
    name: 'Särlatorgets köpställe',
    description: 'Kom och hälsa på mig vid särlatorgets köpställe :)',
    pickupStart: new Date('2025-08-23T08:00:00.000Z'),
  }

  let cookie: string

  before(async () => {
    cookie = await createAdminUser(admin4)
  })

  test('should be possible to create a pickup occasion when authenticated', async (t: TestContext) => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/pickups/',
      body: pickup,
      headers: { cookie },
    })

    t.assert.strictEqual(response.statusCode, 201)
    t.assert.strictEqual(response.json().name, pickup.name)
  })

  test.only('should only patch data that was sent', async (t: TestContext) => {
    const beforeUpdate:  = await app
      .inject({
        method: 'GET',
        url: `/api/pickups/`,
        headers: { cookie },
      })
      .then((res) => res.json())

    beforeUpdate = beforeUpdate.

    const afterUpdate = await app
      .inject({
        method: 'PATCH',
        url: `/api/pickups/${pickupUpdateId}`,
        body: pickupUpdate,
        headers: { cookie },
      })
      .then((res) => res.json())

    // assert that id has not changed
    t.assert.strictEqual(pickupUpdateId, afterUpdate.id)
    // assert that the expected data has changed.
    t.assert.strictEqual(
      {
        name: beforeUpdate.name,
        description: beforeUpdate.description,
        pickupStart: beforeUpdate.pickupStart,
      },
      {
        name: afterUpdate.name,
        description: afterUpdate.description,
        pickupStart: afterUpdate.pickupStart,
      },
    )
    // assert that one of the non-expected data was NOT changed
    t.assert.strictEqual(afterUpdate.pickupEnd, beforeUpdate.pickupEnd)
  })

  after(async () => {
    await db.delete(userTable).where(eq(userTable.username, admin4.username))
  })
})
