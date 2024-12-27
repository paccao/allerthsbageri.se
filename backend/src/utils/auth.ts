import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import cookie from 'cookie'

import { User } from '@/db/schema.ts'
import apiConfig from '@/config/api.ts'
import {
  validateSessionToken,
  deleteSessionTokenCookie,
  setSessionTokenCookie,
} from '@/utils/session.ts'

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
    // CSRF protection
    if (!apiConfig.env.DEV && request.method !== 'GET') {
      const origin = request.headers['Origin'] as string | undefined
      // The Origin could also be compared against the Host or X-Forwarded-Host header.
      if (!origin || !apiConfig.allowedOrigins.includes(origin)) {
        return reply.code(403).send({ message: 'Unexpected origin' })
      }
    }

    // Validate session
    const cookies = cookie.parse(
      (request.headers['Cookie'] as string | undefined) ?? '',
    )
    const token = cookies[apiConfig.sessionCookieName]

    if (token) {
      const { session, user, refreshed } = await validateSessionToken(token)
      if (session) {
        request.user = user

        if (refreshed) {
          setSessionTokenCookie(reply, token, session.expiresAt)
        }
      } else {
        deleteSessionTokenCookie(reply)
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
