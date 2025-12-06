import { DIContainer } from '../DIContainer.ts'
import { Bar, Foo } from './__helpers__/fakeClasses.ts'
import { suite, test, type TestContext } from 'node:test'

suite('DIContainer extend functions', () => {
  test('extends container', (t: TestContext) => {
    const containerWithDatabase = () => {
      return new DIContainer().add('a', () => '1').add('bar', () => new Bar())
    }

    const finalContainer = containerWithDatabase().extend((container) => {
      return container.add('foo', ({ a, bar }) => {
        return new Foo(a, bar)
      })
    })

    t.assert.strictEqual(finalContainer.get('a'), '1')
    t.assert.strictEqual(finalContainer.get('bar') instanceof Bar, true)
    t.assert.strictEqual(finalContainer.get('foo') instanceof Foo, true)
    t.assert.strictEqual(finalContainer.get('foo').name, '1')
  })
})
