// object with keys that can be loaded
// after first load, cache them in the diContainer

// Would it be possible to infer the return type from the loader functions?
// And would it be possible to define the type of the diContainer as the following?
// { [key: keyof typeof loaders]: Awaited<ReturnType<loaders[keyof typeof loaders]>> }

// If so, we could init on first access and cache the property for later.
// However, this would mean some properties technically would return promises before they could be accessed.
// And we can't guarantee that all loaders are synchronous
// So a simpler solution is to keep the container as minimal as possible, and load dependencies outside of it

// type Loaders = Record<string, async () => >

export function createDiContainer<T extends Loaders>() {
  const diContainer = {} as T
  return new Proxy<T>(diContainer, {
    get(target, p, receiver) {
      // If
    },
    // Prevent overrides for now since we don't need it
    set() {
      return false
    },
  })
}
