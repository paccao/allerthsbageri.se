import { after, before, suite, test, type TestContext } from 'node:test'
import { eq } from 'drizzle-orm'

import startApp from '#src/app.ts'
import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import type { GetPickup } from './pickup.schemas.ts'

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
    location:
      'Kakor, bröd, kex. Kom och hälsa på mig på särlatorgets marknad vetja!',
    bookingStart: new Date('2025-08-23T08:00:00.000Z'),
    bookingEnd: new Date('2025-08-28T17:00:00.000Z'),
    pickupStart: new Date('2025-08-29T09:00:00.000Z'),
    pickupEnd: new Date('2025-08-29T15:30:00.000Z'),
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

    const deserialized = response.json()

    t.assert.strictEqual(response.statusCode, 201)
    t.assert.strictEqual(deserialized.name, pickup.name)
    t.assert.strictEqual(
      new Date(deserialized.bookingEnd).getTime() >
        new Date(deserialized.bookingStart).getTime(),
      true,
    )
    t.assert.strictEqual(
      new Date(deserialized.pickupEnd).getTime() >
        new Date(deserialized.pickupStart).getTime(),
      true,
    )
  })

  test('should only patch data that was sent', async (t: TestContext) => {
    const pickupUpdateId = 2
    const pickupUpdate = {
      name: 'Särlatorgets köpställe',
      location: 'Kom och hälsa på mig vid särlatorgets köpställe :)',
      pickupStart: new Date('2025-08-23T08:00:00.000Z'),
      pickupEnd: new Date('2025-08-23T015:00:00.000Z'),
    }

    let beforeUpdateResponse: GetPickup[] = await app
      .inject({
        method: 'GET',
        url: '/api/pickups/',
        headers: { cookie },
      })
      .then((res) => res.json())

    const beforeUpdate = beforeUpdateResponse.find(
      (o) => o.id === pickupUpdateId,
    )

    if (beforeUpdate === undefined) {
      t.assert.fail(
        `Couldn't find a pickup occasion with id ${pickupUpdateId}. Expected value was 2, and it might be because of the seed data in seed.ts`,
      )
    }

    const afterUpdate = await app
      .inject({
        method: 'PATCH',
        url: `/api/pickups/${pickupUpdateId}`,
        body: pickupUpdate,
        headers: { cookie },
      })
      .then((res) => res.json())

    t.assert.strictEqual(
      pickupUpdateId,
      afterUpdate.id,
      'assert that id has not changed',
    )
    t.assert.notStrictEqual(
      {
        name: beforeUpdate.name,
        location: beforeUpdate.location,
        pickupStart: beforeUpdate.pickupStart,
      },
      {
        name: afterUpdate.name,
        location: afterUpdate.location,
        pickupStart: afterUpdate.pickupStart,
      },
      'assert that the data changed',
    )
  })

  test('can not create pickup occasions with dates that are not chronological in time', async (t: TestContext) => {
    const badPickup = {
      id: 5,
      name: 'Testmarknaden',
      location: 'Testa mera tester',
      bookingStart: new Date('2025-08-28T08:00:00.000Z'),
      bookingEnd: new Date('2025-08-23T17:00:00.000Z'),
      pickupStart: new Date('2025-08-29T09:00:00.000Z'),
      pickupEnd: new Date('2025-08-29T08:59:59.999Z'),
    }

    const createdPickup = await app.inject({
      method: 'POST',
      url: '/api/pickups/',
      body: badPickup,
      headers: { cookie },
    })

    t.assert.strictEqual(
      createdPickup.statusCode,
      400,
      'should return status code 400 when incorrect dates was passed to it',
    )
  })

  test('can not update pickup occasions with dates that are not chronological in time', async (t: TestContext) => {
    const goodPickup = {
      name: 'Den bästa marknaden som finns',
      location: 'Bröd',
      bookingStart: new Date('2025-08-22T08:00:00.000Z'),
      bookingEnd: new Date('2025-08-26T17:00:00.000Z'),
      pickupStart: new Date('2025-08-28T09:00:00.000Z'),
      pickupEnd: new Date('2025-08-28T16:59:59.999Z'),
    }

    const createdPickup = await app.inject({
      method: 'POST',
      url: '/api/pickups/',
      body: goodPickup,
      headers: { cookie },
    })

    t.assert.strictEqual(createdPickup.statusCode, 201)

    const badPickup = {
      pickupStart: new Date('2025-08-23T08:00:00.000Z'),
      pickupEnd: new Date('2025-08-23T08:00:00.000Z'),
      bookingStart: new Date('2025-08-25T08:00:00.000Z'),
      bookingEnd: new Date('2025-08-25T14:00:00.000Z'),
    }

    const updatedPickup = await app.inject({
      method: 'PATCH',
      url: `/api/pickups/${createdPickup.json().id}`,
      body: badPickup,
      headers: { cookie },
    })

    t.assert.strictEqual(
      updatedPickup.statusCode,
      400,
      'should return status code 400 when incorrect dates was passed to it',
    )
  })

  after(async () => {
    await db.delete(userTable).where(eq(userTable.username, admin4.username))
  })
})
