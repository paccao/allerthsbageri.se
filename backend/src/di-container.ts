import { DIContainer, type IDIContainer } from 'rsdi'
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
 * Common interface for dependencies, enabling loose coupling across the system.
 */
export type Dependencies = {
  log: ReturnType<typeof createLogger>
  // Ideally, types should not be tied to specific implementations but rather define shared interfaces.
  // However, we need to use the inferred type to get full type safety for our specific DB connection, driver and schema.
  // This still allows replacing the DB during testing, since we use the same DB driver and schema,
  // although not the exact same implementation.
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

/** The main container with resolved dependencies */
export type DependencyContainer = IDIContainer<Dependencies>

/**
 * Create a dependency container to connect various parts of the system
 * while still preserving a loose coupling between them.
 *
 * The modules only get instantiated when they first are used.
 *
 * We can create several dependency containers across the system which work together.
 * For example, overriding a specific dependency for a part of the system, or even globally depending on the environment
 * Containers could also have different lifetimes, for example only during an incoming request.
 *
 * NOTE: Registered dependencies should not have side-effects in the top-level of their modules.
 * This is because their modules will get imported even if they don't get used immediately.
 *
 * @param overrides Optionally pass in specific implementations you want to use.
 * @returns A complete diContainer which uses default implementations unless you override them.
 */
export function createDependencyContainer(
  overrides?: IDIContainer<Partial<Dependencies>>,
): DependencyContainer {
  /**
   * Register the default dependency resolvers here.
   * This gives a good overview of which dependencies are connected.
   */
  const container = new DIContainer()
    // Common dependencies
    .add('log', () => createLogger())
    .add('db', ({ log }) => createDBConnection(log))
    // Sessions and Auth
    .add('sessionService', ({ db }) => new SessionService(db))
    .add('authService', ({ db }) => new AuthService(db))
    .add('authController', ({ sessionService, authService }) =>
      createAuthController(sessionService, authService),
    )
    // Customer
    .add('customerService', ({ db }) => new CustomerService(db))
    .add('customerController', ({ customerService }) =>
      createCustomerController(customerService),
    )
    // Pickup Occasion
    .add('pickupOccasionService', ({ db }) => new PickupOccasionService(db))
    .add('pickupOccasionController', ({ pickupOccasionService }) =>
      createPickupOccasionController(pickupOccasionService),
    )
    // Product Details
    .add('productDetailsService', ({ db }) => new ProductDetailsService(db))
    .add('productDetailsController', ({ productDetailsService }) =>
      createProductDetailsController(productDetailsService),
    )
    // Product
    .add('productService', ({ db, log }) => new ProductService(db, log))
    .add('productController', ({ productService }) =>
      createProductController(productService),
    )
    // Order Status
    .add('orderStatusService', ({ db, log }) => new OrderStatusService(db, log))
    // Order
    .add('orderService', ({ db }) => new OrderService(db))
    .add(
      'orderController',
      ({
        orderService,
        orderStatusService,
        pickupOccasionService,
        customerService,
      }) =>
        createOrderController(
          orderService,
          orderStatusService,
          pickupOccasionService,
          customerService,
        ),
    )

  return overrides ? container.merge(overrides) : container
}
