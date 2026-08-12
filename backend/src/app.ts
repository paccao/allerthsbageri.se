import Fastify, { type FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import apiConfig from './config/api.js'
import {
  sessionPlugin,
  authenticationRequiredPlugin,
} from './modules/auth/auth.plugins.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { pickupOccasionRoutes } from './modules/pickup-occasion/pickup-occasion.routes.js'
import { customerRoutes } from './modules/customer/customer.routes.js'
import { orderRoutes } from './modules/order/order.routes.js'
import { productRoutes } from './modules/product/product.routes.js'
import { productDetailsRoutes } from './modules/product-details/product-details.routes.js'
import type { DependencyContainer } from './di-container.js'

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
    const developmentContext = (await import('./utils/development-context.js'))
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
  app.register(pickupOccasionRoutes, { prefix: 'api/pickup-occasions' })
  app.register(customerRoutes, { prefix: 'api/customers' })
  app.register(orderRoutes, { prefix: 'api/orders' })
  app.register(productRoutes, { prefix: 'api/products' })
  app.register(productDetailsRoutes, { prefix: 'api/product-details' })
}

export default startApp
