import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

import { User } from '@/db/schema.ts'
import { db } from '@/db/index.ts'

declare module 'fastify' {
  export interface FastifyRequest {
    user?: Pick<User, 'id'>
  }
}

/**
 * Automatically set the signed in user based on the session cookie.
 */
export const sessionPlugin: FastifyPluginAsync = fp(async (server) => {
  server.addHook('onRequest', async (request, reply) => {
    const sessionId = lucia.readSessionCookie(request.headers.cookie ?? '')
    if (!sessionId) return

    const { session, user } = await lucia.validateSession(sessionId)
    if (session) {
      request.user = user

      if (session.fresh) {
        reply.header(
          'Set-Cookie',
          lucia.createSessionCookie(session.id).serialize(),
        )
      }
    }
  })
})

/**
 * Plugin to ensure the user is authenticated.
 * All routes registered after this plugin will require authentication.
 */
export const authenticationRequiredPlugin: FastifyPluginAsync = fp(
  async (server) => {
    server.addHook('onRequest', (request, reply, done) => {
      if (!request.user) {
        reply.code(401).send({ message: 'Unauthorized' })
      }

      done()
    })
  },
)
