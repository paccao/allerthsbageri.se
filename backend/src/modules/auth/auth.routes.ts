import { FastifyInstance } from 'fastify'
import { signInBodySchema, signUpBodySchema } from './auth.schemas.ts'
import { signInHandler, signUpHandler } from './auth.controller.ts'

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/sign-up',
    {
      schema: {
        body: signUpBodySchema,
      },
    },
    signUpHandler,
  )

  // app.post(
  //   '/sign-in',
  //   {
  //     schema: {
  //       body: signInBodySchema,
  //     },
  //   },
  //   signInHandler,
  // )

  //   app.post('/logout', { schema: logoutJSONSchema }, logoutHandler)
}
