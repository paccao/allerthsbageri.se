import { createLogger } from './logger.ts'
import { createDBConnection } from '#db/index.ts'
import { SessionService } from '#src/modules/auth/session.service.ts'
import { AuthService } from './modules/auth/auth.service.ts'
import { createAuthController } from './modules/auth/auth.controller.ts'
import { CustomerService } from './modules/customer/customer.service.ts'
import { createCustomerController } from './modules/customer/customer.controller.ts'
import { OrderStatusService } from './modules/order-status/order-status.service.ts'
import { OrderService } from './modules/order/order.service.ts'
import { createOrderController } from './modules/order/order.controller.ts'
import { PickupOccasionService } from './modules/pickup-occasion/pickup-occasion.service.ts'
import { createPickupOccasionController } from './modules/pickup-occasion/pickup-occasion.controller.ts'
import { ProductDetailsService } from './modules/product-details/product-details.service.ts'
import { createProductDetailsController } from './modules/product-details/product-details.controller.ts'
import { ProductService } from './modules/product/product.service.ts'
import { createProductController } from './modules/product/product.controller.ts'

/**
 * Common interfaces for dependencies, allowing loose coupling across the system.
 *
 * By defining the public APIs here, we can have several dependency containers across the system which work together.
 * For example, overriding a specific dependency for a part of the system, or even globally depending on the environment
 *
 * NOTE: The order is important as it reflects what depends on what.
 */
export type DependencyContainer = {
  logger: ReturnType<typeof createLogger>
  // Ideally, types should not be tied to the actual implementations but rather define the shared interfaces.
  // However, since we want full type safety for the DB connection, we use the expected shape of the actual DB driver and DB schema.
  // This still allows replacing the DB during testing, since we use the same DB driver and schema, although not the exact same implementation.
  db: ReturnType<typeof createDBConnection>

  sessionService: SessionService
  authService: AuthService
  authController: ReturnType<typeof createAuthController>

  customerService: CustomerService
  customerController: ReturnType<typeof createCustomerController>

  pickupOccasionService: PickupOccasionService
  pickupOccasionController: ReturnType<typeof createPickupOccasionController>

  productDetailsService: ProductDetailsService
  productDetailsController: ReturnType<typeof createProductDetailsController>

  productService: ProductService
  productController: ReturnType<typeof createProductController>

  orderStatusService: OrderStatusService

  orderService: OrderService
  orderController: ReturnType<typeof createOrderController>
}

// TODO: Maybe we could use a proxy to initiate dependencies the first time they are needed?
// We could take inspiration from the implementation of get() and _inject() from here: https://github.com/claudijo/di-container/blob/master/index.js
// This might be useful to reduce the startup time by avoiding imports of modules unless they are used.
// Autoloading would be useful to avoid explicit imports

/**
 * Create a dependency container to encapsulate all core dependencies in one place.
 *
 * This minimal implementation uses the Inversion of Control (IoC) pattern and meets our current needs.
 * If we need more advanced features in the future, it will be easier to integrate a
 * third-party DI framework since we now have core pattern in place.
 *
 * NOTE: Registered dependencies should not have side-effects in their modules since they get imported even if they don't get used.
 *
 * @param overrides Optionally pass in specific implementations you want to use.
 * @returns A complete diContainer which uses default implementations unless you override them.
 */
export function createDependencyContainer(
  overrides: Partial<DependencyContainer> = {},
) {
  // NOTE: We likely need a dependency graph for this to work.
  // Or implement it as a getter, which resolves the module async by default
  // TODO: Maybe if we load dependencies in the order they are requested, then it will all work out?
  // IDEA: Review the implementation of the `awilix` framework, and create a minimal implementation only with the features we need.
  // I wonder how they implement `container.resolve('module')` in a synchronous way?
  // It likely works because they likely use require() internally which allows synchronous module loading.

  // IDEA: These could be async functions to only import the default modules if needed.
  // Since we could use create the container async and then create instances synchronously.

  /**
   * Registry for all default constructors used to init the dependencies.
   *
   * NOTE: The order is important to ensure dependencies are available when they are needed.
   */
  const registry: Record<
    keyof DependencyContainer,
    FunctionFactory | ClassFactory
  > = {
    logger: createLogger,

    db: createDBConnection,

    sessionService: SessionService,
    authService: AuthService,
    authController: createAuthController,

    customerService: CustomerService,
    customerController: createCustomerController,

    pickupOccasionService: PickupOccasionService,
    pickupOccasionController: createPickupOccasionController,

    productDetailsService: ProductDetailsService,
    productDetailsController: createProductDetailsController,

    productService: ProductService,
    productController: createProductController,

    orderStatusService: OrderStatusService,

    orderService: OrderService,
    orderController: createOrderController,
  }

  /**
   * Where we successively add the dependencies
   */
  const diContainer = {} as DependencyContainer

  /**
   * Initiates a dependency no matter if it's a factory function or a class
   *
   * @param Constructor The factory function or class constructor
   * @param diContainer The dependencies so far
   * @returns The constructed dependency
   */
  function init(
    Constructor: (typeof registry)[keyof DependencyContainer],
    diContainer: DependencyContainer,
  ) {
    if (Constructor.toString().startsWith('class')) {
      return new (Constructor as ClassFactory)(diContainer)
    } else if (Constructor.toString().startsWith('function')) {
      return (Constructor as FunctionFactory)(diContainer)
    }

    throw new Error('Registry entries must be functions or classes')
  }

  // Successively building up the diContainer and make more dependencies available for later modules
  // This wires everything together in a given order, without letting the implementations know about each other
  for (const [key, Constructor] of Object.entries(registry) as [
    keyof DependencyContainer,
    (typeof registry)[keyof DependencyContainer],
  ][]) {
    // 1) Use override[key] if provided.
    // 2) Otherwise, instantiate the dependency
    // @ts-expect-error Unsure how to type this properly. Ideally, we could type check the partial diContainers to ensure we instantiate dependencies in the correct order
    diContainer[key] = overrides[key] ?? init(Constructor, diContainer)
  }

  return diContainer

  // IDEA: We could just load the modules first, but only instantiate them when actually requested.
  // This way, createContainer() would be async, but after that all resolutions could be sync
  // This would create the cleanest API
  // Here's the magic for loading the modules: https://github.com/jeffijoe/awilix/blob/master/src/container.ts#L690-L702
  // This means we could load modules up front, and only instantiate them when needed
}

type FunctionFactory = (diContainer: DependencyContainer) => unknown
type ClassFactory = new (diContainer: DependencyContainer) => unknown
