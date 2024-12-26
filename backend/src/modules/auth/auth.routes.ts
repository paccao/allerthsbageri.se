import { FastifyInstance } from 'fastify'
import { signInBodySchema, signUpBodySchema } from './auth.schemas.ts'
import { signInHandler, signUpHandler } from './auth.controller.ts'
import { tags } from '@/utils/openAPI.ts'

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/sign-up',
    {
      schema: {
        body: signUpBodySchema,
        tags: tags('auth'),
      },
    },
    signUpHandler,
  )

  app.post(
    '/sign-in',
    {
      schema: {
        body: signInBodySchema,
        tags: tags('auth'),
      },
    },
    signInHandler,
  )

  //   app.post('/logout', { schema: logoutJSONSchema }, logoutHandler)
}
