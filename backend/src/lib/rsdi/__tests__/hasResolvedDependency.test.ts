import { DIContainer } from '../DIContainer.ts'
import { suite, test, type TestContext } from 'node:test'

suite('DIContainer hasResolvedDependency', () => {
  test('has resolves dependency', (t: TestContext) => {
    const container = new DIContainer().add('foo', (diContainer) => {
      // @ts-expect-error - expected type error
      diContainer.add('c', () => '2')
      return 123
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    container.foo

    t.assert.strictEqual(container.hasResolvedDependency('foo'), true)
  })

  test('does not have resolves dependency', (t: TestContext) => {
    const container = new DIContainer().add('foo', (diContainer) => {
      // @ts-expect-error - expected type error
      diContainer.add('c', () => '2')
      return 123
    })
    t.assert.strictEqual(container.hasResolvedDependency('foo'), false)
  })
})
