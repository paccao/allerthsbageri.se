import type { FastifyInstance } from 'fastify'
import { signInBodySchema, signUpBodySchema } from './auth.schemas.ts'
import {
  signInHandler,
  signOutHandler,
  signUpHandler,
} from './auth.controller.ts'
import { getTags } from '#utils/openAPI.ts'

const tags = getTags('auth')

export async function authRoutes(app: FastifyInstance) {
  // TODO: Only allow signed-in admin users to use this route to add more users
  app.post(
    '/sign-up',
    {
      schema: {
        body: signUpBodySchema,
        tags,
      },
    },
    signUpHandler,
  )

  app.post(
    '/sign-in',
    {
      schema: {
        body: signInBodySchema,
        tags,
      },
    },
    signInHandler,
  )

  app.post(
    '/sign-out',
    {
      schema: {
        tags,
      },
    },
    signOutHandler,
  )
}
