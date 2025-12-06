import { DIContainer } from '../DIContainer.ts'
import { Buzz } from './__helpers__/fakeClasses.ts'
import { suite, test, type TestContext } from 'node:test'

suite('DIContainer merge containers', () => {
  test('clone container', (t: TestContext) => {
    const baseContainer = new DIContainer().add('a', () => 'a')

    const boundedContextA = baseContainer
      .clone()
      .add('buzz', () => new Buzz('buzzA'))
    // if we clone the container, we can safele define new with the same name
    const boundedContextB = baseContainer
      .clone()
      .add('buzz', () => new Buzz('buzzB'))

    t.assert.strictEqual(boundedContextA.buzz.name, 'buzzA')
    t.assert.strictEqual(boundedContextB.buzz.name, 'buzzB')
  })

  test('clone container after dependency resolution', (t: TestContext) => {
    const baseContainer = new DIContainer().add('buzz', () => new Buzz('buzzA'))
    // resolve buzz dependency
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const buzz = baseContainer.buzz

    const boundedContextA = baseContainer.clone()
    const boundedContextB = baseContainer.clone()

    t.assert.strictEqual(boundedContextA.buzz.name, 'buzzA')
    t.assert.strictEqual(boundedContextB.buzz.name, 'buzzA')

    boundedContextA.buzz.name = 'buzzB'
    t.assert.strictEqual(boundedContextA.buzz.name, 'buzzB')
    t.assert.strictEqual(boundedContextB.buzz.name, 'buzzB')
  })
})
