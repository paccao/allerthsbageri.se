import { before, suite, test, type TestContext } from 'node:test'

import { createInMemoryTestDB } from '#db/test-db.ts'
import { createDependencyContainer } from '#src/di-container.ts'
import { getTestingUtils } from '#utils/testing-utils.ts'
import startApp from '#src/app.ts'

const app = await startApp(
  createDependencyContainer({ db: await createInMemoryTestDB() }),
)

const { createAdminUser } = getTestingUtils(app)

suite('pickup occasion routes', () => {
  const admin4 = {
    username: 'admin4',
    name: 'Admin4',
    password: '123456',
  }

  let cookie: string

  before(async () => {
    cookie = await createAdminUser(admin4)
  })

  test('should be possible to create a pickup occasion when authenticated', async (t: TestContext) => {
    const pickup = {
      name: 'Särlatorgets marknad',
      location:
        'Kakor, bröd, kex. Kom och hälsa på mig på särlatorgets marknad vetja!',
      orderStart: new Date('2025-08-23T08:00:00.000Z'),
      orderEnd: new Date('2025-08-28T17:00:00.000Z'),
      pickupStart: new Date('2025-08-29T09:00:00.000Z'),
      pickupEnd: new Date('2025-08-29T15:30:00.000Z'),
    }

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
      new Date(deserialized.orderEnd).getTime() >
        new Date(deserialized.orderStart).getTime(),
      true,
    )
    t.assert.strictEqual(
      new Date(deserialized.pickupEnd).getTime() >
        new Date(deserialized.pickupStart).getTime(),
      true,
    )
  })

  test('should only patch data that was sent', async (t: TestContext) => {
    const pickup = {
      name: 'testData namn',
      location: 'Kakor, bröd, kex. Kom och köp!',
      orderStart: new Date('2025-08-23T08:00:00.000Z'),
      orderEnd: new Date('2025-08-28T17:00:00.000Z'),
      pickupStart: new Date('2025-08-29T09:00:00.000Z'),
      pickupEnd: new Date('2025-08-29T15:30:00.000Z'),
    }

    const createdPickup = await app.inject({
      method: 'POST',
      url: '/api/pickups/',
      body: pickup,
      headers: { cookie },
    })

    const createdPickupDeserialized = createdPickup.json()

    t.assert.strictEqual(createdPickup.statusCode, 201)

    const pickupUpdate = {
      name: 'Särlatorgets köpställe',
      location: 'Kom och hälsa på mig vid särlatorgets köpställe :)',
      pickupStart: new Date('2025-08-23T08:00:00.000Z'),
      pickupEnd: new Date('2025-08-23T15:00:00.000Z'),
    }

    const afterUpdate = await app
      .inject({
        method: 'PATCH',
        url: `/api/pickups/${createdPickupDeserialized.id}`,
        body: pickupUpdate,
        headers: { cookie },
      })
      .then((res) => res.json())

    t.assert.strictEqual(
      createdPickupDeserialized.id,
      afterUpdate.id,
      'assert that id has not changed',
    )
    t.assert.notStrictEqual(
      {
        name: createdPickupDeserialized.name,
        location: createdPickupDeserialized.location,
        pickupStart: createdPickupDeserialized.pickupStart,
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
      name: 'Testmarknaden',
      location: 'Testa mera tester',
      orderStart: new Date('2025-08-28T08:00:00.000Z'),
      orderEnd: new Date('2025-08-23T08:00:00.000Z'),
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
      'should return status code 400 for incorrect dates',
    )
  })

  test('can not update pickup occasions with dates that are not chronological in time', async (t: TestContext) => {
    const goodPickup = {
      name: 'Den bästa marknaden som finns',
      location: 'Bröd',
      orderStart: new Date('2025-08-22T08:00:00.000Z'),
      orderEnd: new Date('2025-08-26T17:00:00.000Z'),
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
      orderStart: new Date('2025-08-25T08:00:00.000Z'),
      orderEnd: new Date('2025-08-25T07:59:59.000Z'),
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
      'should return status code 400 for incorrect dates',
    )
  })
})
