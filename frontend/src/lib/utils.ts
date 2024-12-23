/**
 * Call a function once and then remove it.
 * This is useful for event handlers that should only run once.
 */
export function once(fn: Function) {
  return function (this: Function, event: Event) {
    if (fn) fn.call(this, event)
    // @ts-expect-error
    fn = null
  }
}
