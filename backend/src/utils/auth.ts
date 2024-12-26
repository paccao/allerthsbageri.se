import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

import { User } from '@/db/schema.ts'
import { db } from '@/db/index.ts'
import apiConfig from '@/config/api.ts'

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
    if (request.method !== 'GET') {
      const origin = request.headers['Origin'] as string | undefined
      // You can also compare it against the Host or X-Forwarded-Host header.
      if (!origin || !apiConfig.allowedOrigins.includes(origin)) {
        return reply.status(403)
      }
    }

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
