import { DIContainer } from '../DIContainer.ts'
import {
  DenyOverrideDependencyError,
  DependencyIsMissingError,
  ForbiddenNameError,
} from '../errors.ts'
import { Bar, Foo } from './__helpers__/fakeClasses.ts'
import { suite, test, type TestContext } from 'node:test'

suite('DIContainer typescript type resolution', () => {
  test('it resolves type as given raw values', (t: TestContext) => {
    const container = new DIContainer()
      .add('a', () => 123)
      .add('d', ({ a }) => a)
      .add('b', () => 'string')

    container.add('v', () => new Date())

    t.assert.strictEqual(container.get('a'), 123)
    t.assert.strictEqual(container.get('b'), 'string')
    t.assert.strictEqual(container.get('d'), 123)
  })

  test('it resolves object', (t: TestContext) => {
    const container = new DIContainer()
      .add('a', () => 'hello')
      .add('bar', () => new Bar())
      .add('foo', ({ a, bar }) => new Foo(a, bar))

    const foo = container.get('foo')
    t.assert.strictEqual(foo instanceof Foo, true)
    t.assert.strictEqual(foo.name, 'hello')
    t.assert.strictEqual(foo.bar instanceof Bar, true)
  })

  test('it resolves function', (t: TestContext) => {
    const aConcat = (a: string) => a + 'a'
    const container = new DIContainer()
      .add('a', () => 'hello')
      .add('aConcat', (value) => aConcat(value.a))

    const aConcatValue = container.get('aConcat')
    t.assert.strictEqual(aConcatValue, 'helloa')
  })

  test('deny override resolvers by key with add method', (t: TestContext) => {
    const container = new DIContainer().add('key1', () => 'value 1')

    t.assert.throws(() => {
      container
        // @ts-expect-error - expected type error
        .add('key1', () => new Date())
    }, new DenyOverrideDependencyError('key1'))

    const value = container.get('key1')
    t.assert.strictEqual(value, 'value 1')
  })

  test('override resolvers by key with update method', (t: TestContext) => {
    const container = new DIContainer().add('key1', () => 'value 1')

    container.update('key1', () => true)

    const value = container.get('key1')
    t.assert.strictEqual(value, true)
  })

  test('it throws an error if definition is missing during resolution', (t: TestContext) => {
    const container = new DIContainer()
    t.assert.throws(() => {
      // @ts-expect-error - expected type error
      container.get('Logger')
    }, new DependencyIsMissingError('Logger'))
  })

  test('it always returns singleton', (t: TestContext) => {
    const container = new DIContainer()
      .add('a', () => 'name1')
      .add('bar', () => new Bar())
      .add('foo', (deps) => new Foo(deps.a, deps.bar))

    const foo = container.get('foo')
    t.assert.strictEqual(foo.name, 'name1')
    foo.name = 'name2'
    const foo2 = container.get('foo')
    t.assert.strictEqual(foo2.name, 'name2')
  })

  test('cannot not add method "add" to the container', (t: TestContext) => {
    t.assert.throws(() => {
      new DIContainer().add('add', () => 213)
    }, ForbiddenNameError)
  })
})
