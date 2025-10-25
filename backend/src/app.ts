import Fastify, { type FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import apiConfig from './config/api.ts'
import { sessionPlugin, authenticationRequiredPlugin } from './utils/auth.ts'
import { authRoutes } from './modules/auth/auth.routes.ts'
import { pickupRoutes } from './modules/pickup/pickup.routes.ts'
import { customerRoutes } from './modules/customer/customer.routes.ts'
import { customerOrderRoutes } from './modules/order/customer-order.routes.ts'
import { productRoutes } from './modules/product/product.routes.ts'
import { productDetailsRoutes } from './modules/product-details/product-details.routes.ts'
import { orderStatusRoutes } from './modules/order-status/order-status.routes.ts'

async function startApp() {
  const app = Fastify({
    logger: apiConfig.logger,
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(sessionPlugin)

  if (apiConfig.env.DEV) {
    const developmentContext = await import('./utils/development-context.ts')

    app.register(fp(developmentContext.default))
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
  app.register(pickupRoutes, { prefix: 'api/pickups' })
  app.register(customerRoutes, { prefix: 'api/customers' })
  app.register(customerOrderRoutes, { prefix: 'api/customer-orders' })
  app.register(orderStatusRoutes, { prefix: 'api/order-status' })
  app.register(productRoutes, { prefix: 'api/products' })
  app.register(productDetailsRoutes, { prefix: 'api/product-details' })
}

export default startApp
