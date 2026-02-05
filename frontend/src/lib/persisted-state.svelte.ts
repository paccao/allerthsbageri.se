import z from 'zod'
import { onDestroy } from 'svelte'
import { createSubscriber } from 'svelte/reactivity'
import { on } from 'svelte/events'

const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined'

/**
 * Persist state to localStorage, encoding and decoding data using the provided schema.
 * The persisted state is guaranteed to always match the schema, and will fall back to the initial value to recover from errors.
 */
export class PersistedState<
  Schema extends z.core.$ZodType,
  T extends z.infer<Schema> = z.infer<Schema>,
> {
  #current = $state<T>(undefined as T)
  #key: string
  #codec: ReturnType<typeof jsonCodec<Schema>>
  #initialValue: T
  #subscribe: () => void

  /**
   * Create a new persisted state instance
   *
   * @param key Unique key used in the storage
   * @param initialValue Default state
   * @param codec Zod Codec for encoding and decoding the state.
   */
  constructor(key: string, initialValue: T, schema: Schema) {
    this.#key = key
    this.#codec = jsonCodec(schema)
    this.#initialValue = initialValue

    this.#current = (isBrowser ? this.#readPersistedValue() : initialValue) as T

    this.#subscribe = createSubscriber((update) => {
      // Sync state across tabs
      return on(window, 'storage', (e: StorageEvent) => {
        if (e.key === key) {
          const val = this.#readPersistedValue()
          if (val) {
            this.#current = val as T
            update()
          }
        }
      })
    })

    $effect.root(() => {
      let hasRunBefore = false
      this.#subscribe()

      $effect(() => {
        $inspect(this.#current, hasRunBefore)

        if (hasRunBefore) {
          this.#writePersistedValue(this.#current)
        } else {
          hasRunBefore = true
        }
      })
    })
  }

  #readPersistedValue() {
    const stored = localStorage.getItem(this.#key)
    if (!stored) return this.#initialValue

    try {
      const decoded = this.#codec.decode(stored)
      return decoded
    } catch (error: unknown) {
      console.error(error)
      return this.#initialValue
    }
  }

  #writePersistedValue(value: T) {
    console.log('writing value:', value)
    try {
      const encoded = this.#codec.encode(value)
      localStorage.setItem(this.#key, encoded)
    } catch (error: unknown) {
      console.error(error)
    }
  }

  get current() {
    return this.#current
  }

  set current(newValue: T) {
    this.#current = newValue
  }

  reset() {
    this.#current = this.#initialValue
  }
}

// Inspired by https://www.puruvj.dev/blog/svelte-5-runic-persist-theming
//
// Improvements:
// 1) Use Zod Codecs to simplify type-safe encoding and decoding. This combines the schema and the encoding/decoding methods into one and the same argument. Simplifying the code and making sure they are related.
// 2) Simplify generic types by using a second type parameter for the data to allow using just `T` instead of `z.infer<T>` in multiple locations.
// 3) Ensure the utiity works with Svelte even for projects that don't use SvelteKit. Easy fix by replacing `$app/environment` with a framework-agnostic browser check.
//
// Improvements compared to https://github.com/oMaN-Rod/svelte-persisted-state/blob/b203ccf44e404efcd0630f40913a75a4b9e348dd/src/lib/index.svelte.ts
// 1) Schema-based parsing
// 2) Focused on our needs of storing in localStorage
// 3) Our solution is simpler and uses less code
//
// Improvements compared to PersistedState from the runed library:
// 1) Our solution supports schema-based parsing and serialization, greatly improving the type safety and runtime safety
// 2) Minimal API - we can remove runed as a dependency if we don't need more from that library and keep everything in our own code which stays standards compliant and will keep working even across dependency updates

/**
 * Parses JSON strings into structured data and serializes back to JSON.
 * This generic function accepts an output schema to validate the parsed JSON data.
 *
 * Based on https://zod.dev/codecs#jsonschema
 */
export const jsonCodec = <T extends z.core.$ZodType>(schema: T) =>
  z.codec(z.string(), schema, {
    decode: (jsonString, ctx) => {
      try {
        return JSON.parse(jsonString)
      } catch (err: any) {
        ctx.issues.push({
          code: 'invalid_format',
          format: 'json',
          input: jsonString,
          message: err.message,
        })
        return z.NEVER
      }
    },
    encode: (value) => JSON.stringify(value),
  })

/**
 * Behaves the same as `$effect.root`, but automatically
 * cleans up the effect inside Svelte components.
 *
 * When used outside of Svelte components, the cleanup function needs to be called manually.
 *
 * @returns Cleanup function to manually cleanup the effect.
 */
export function effectRootWithComponentCleanup(fn: () => void | VoidFunction) {
  let cleanup: VoidFunction | null = $effect.root(fn)

  function destroy() {
    if (cleanup !== null) {
      cleanup()
      cleanup = null
    }
  }

  try {
    onDestroy(destroy)
  } catch {
    // Ignore the error. The user is responsible for manually
    // cleaning up effects created outside Svelte components.
  }

  return destroy
}
