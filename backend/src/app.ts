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
import { orderRoutes } from './modules/order/order.routes.ts'
import { productRoutes } from './modules/product/product.routes.ts'

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
  app.register(orderRoutes, { prefix: 'api/orders' })
  app.register(productRoutes, { prefix: 'api/products' })
}

export default startApp
