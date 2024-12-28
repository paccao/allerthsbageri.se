import Fastify, { type FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import apiConfig from './config/api.ts'
import { sessionPlugin, authenticationRequiredPlugin } from './utils/auth.ts'
import { authRoutes } from './modules/auth/auth.routes.ts'
import { pickupRoutes } from './modules/pickup/pickup.routes.ts'
import { customerRoutes } from './modules/customer/customer.routes.ts'
import { orderRoutes } from './modules/order/order.routes.ts'

const server = Fastify({
  logger: apiConfig.logger,
}).withTypeProvider<ZodTypeProvider>()

async function initServer() {
  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)

  server.register(sessionPlugin)

  if (apiConfig.env.DEV) {
    const developmentContext = await import('./utils/developmentContext.ts')

    server.register(fp(developmentContext.default))
  }

  server.register(publicContext)
  server.register(authenticatedContext)

  return server
}

/**
 * This context wraps all logic that should be public.
 */
async function publicContext(server: FastifyInstance) {
  server.get('/healthcheck', async () => ({ ok: true }))
  server.register(authRoutes, { prefix: 'api/auth' })
}

/**
 * This context wraps all logic that requires authentication.
 */
async function authenticatedContext(server: FastifyInstance) {
  server.register(authenticationRequiredPlugin)
  server.register(pickupRoutes, { prefix: 'api/pickups' })
  server.register(customerRoutes, { prefix: 'api/customers' })
  server.register(orderRoutes, { prefix: 'api/orders' })
}

export default initServer
