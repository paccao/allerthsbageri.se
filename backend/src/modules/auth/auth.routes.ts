import type { FastifyInstance } from 'fastify'

import { signInBodySchema, signUpBodySchema } from './auth.schemas.js'
import { getTags } from '#config/openapi.js'

const tags = getTags('auth')

export async function authRoutes(app: FastifyInstance) {
  const { authController } = app.diContainer
  // TODO: Only allow signed-in admin users to use this route to add more users
  app.post(
    '/sign-up',
    {
      schema: {
        body: signUpBodySchema,
        tags,
      },
    },
    authController.signUpHandler,
  )

  app.post(
    '/sign-in',
    {
      schema: {
        body: signInBodySchema,
        tags,
      },
    },
    authController.signInHandler,
  )

  app.post(
    '/sign-out',
    {
      schema: {
        tags,
      },
    },
    authController.signOutHandler,
  )
}
