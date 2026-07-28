/**
 * Results are useful to consistently handle operations that might fail.
 */
export type Result<T, E = Error> =
  { ok: true; value: T } | { ok: false; error: E }

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function err<E = Error>(error: E): Result<never, E> {
  return { ok: false, error }
}

/**
 * Call a function and return a Result, wrapping either
 * the successful return value or any thrown errors
 */
export async function tryFail<T, E = Error>(
  fn: (() => Promise<T>) | (() => T),
): Promise<Result<T, E>> {
  try {
    const value = await fn()
    return ok(value)
  } catch (error: unknown) {
    return err(error as E)
  }
}
