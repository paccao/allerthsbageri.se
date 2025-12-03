import Fastify, { type FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import apiConfig from './config/api.ts'
import {
  sessionPlugin,
  authenticationRequiredPlugin,
} from './modules/auth/auth.plugins.ts'
import { authRoutes } from './modules/auth/auth.routes.ts'
import { pickupOccasionRoutes } from './modules/pickup-occasion/pickup-occasion.routes.ts'
import { customerRoutes } from './modules/customer/customer.routes.ts'
import { orderRoutes } from './modules/order/order.routes.ts'
import { productRoutes } from './modules/product/product.routes.ts'
import { productDetailsRoutes } from './modules/product-details/product-details.routes.ts'
import type { DependencyContainer } from './di-container.ts'

declare module 'fastify' {
  export interface FastifyInstance {
    /** Global dependencies that should be available across the app */
    diContainer: DependencyContainer
  }
}

async function startApp(diContainer: DependencyContainer) {
  const app = Fastify({
    loggerInstance: diContainer.log,
  }).withTypeProvider<ZodTypeProvider>()

  // Make global dependencies available on the app instance
  app.decorate('diContainer', diContainer)

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(sessionPlugin)

  if (apiConfig.env.DEV) {
    const developmentContext = (await import('./utils/development-context.ts'))
      .default

    app.register(fp(developmentContext))
  }

  app.register(publicContext)
  app.register(authenticatedContext)

  return app
}

/**
 * This context wraps all logic that should be public.
 */
async function publicContext(app: FastifyInstance) {
  app.get('/health-check', async () => ({ ok: true }))
  app.register(authRoutes, { prefix: 'api/auth' })
}

/**
 * This context wraps all logic that requires authentication.
 */
async function authenticatedContext(app: FastifyInstance) {
  app.register(authenticationRequiredPlugin)
  app.register(pickupOccasionRoutes, { prefix: 'api/pickups' })
  app.register(customerRoutes, { prefix: 'api/customers' })
  app.register(orderRoutes, { prefix: 'api/orders' })
  app.register(productRoutes, { prefix: 'api/products' })
  app.register(productDetailsRoutes, { prefix: 'api/product-details' })
}

export default startApp
