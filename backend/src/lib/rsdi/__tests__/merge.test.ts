import { DIContainer } from '../DIContainer.ts'
import { Bar, Buzz } from './__helpers__/fakeClasses.ts'
import { suite, test, type TestContext } from 'node:test'

suite('DIContainer merge containers', () => {
  test('merge empty container', (t: TestContext) => {
    const containerA = new DIContainer()
      .add('a', () => '1')
      .add('bar', () => new Bar())
    const finalContainer = containerA.merge(new DIContainer())

    t.assert.strictEqual(finalContainer.a, '1')
    t.assert.strictEqual(finalContainer.bar instanceof Bar, true)
  })

  test('merge 2 containers', (t: TestContext) => {
    const containerA = new DIContainer()
      .add('a', () => '1')
      .add('bar', () => new Bar())

    const containerB = new DIContainer()
      .add('b', () => 'b')
      .add('buzz', () => new Buzz('buzz'))

    const finalContainer = containerA.merge(containerB)

    t.assert.strictEqual(finalContainer.a, '1')
    t.assert.strictEqual(finalContainer.b, 'b')
    t.assert.strictEqual(finalContainer.bar instanceof Bar, true)
    t.assert.strictEqual(finalContainer.buzz.name, 'buzz')
  })

  test('merge 2 containers - merged container overwrites properties', (t: TestContext) => {
    const containerA = new DIContainer().add('a', () => '1')

    const containerB = new DIContainer().add('a', () => '2')

    const finalContainer = containerA.merge(containerB)

    t.assert.strictEqual(finalContainer.a, '2')
  })

  test('resolved properties only once', (t: TestContext) => {
    const containerA = new DIContainer().add('buzz', () => new Buzz('buzz'))
    const buzzInstance = containerA.buzz
    t.assert.strictEqual(buzzInstance.name, 'buzz')

    buzzInstance.name = 'buzz2'

    const containerB = new DIContainer().add('a', () => '2')

    const finalContainer = containerA.merge(containerB)

    t.assert.strictEqual(finalContainer.buzz.name, 'buzz2')
  })
})
