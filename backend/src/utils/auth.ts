import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

import type { User } from '#db/schema.ts'
import apiConfig from '#config/api.ts'
import {
  validateSessionToken,
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  parseSessionTokenFromCookie,
} from '#utils/session.ts'

declare module 'fastify' {
  export interface FastifyRequest {
    user?: Pick<User, 'id'>
  }
}

// IDEA: Even better with more specific types
// declare module 'fastify' {
//   export interface FastifyRequest {
//     user: User | null
//   }

//   export interface AuthenticatedFastifyRequest<T extends RouteGenericInterface>
//     extends FastifyRequest<T> {
//     user: User
//   }
// }

/**
 * Automatically set the signed in user based on the session cookie.
 */
export const sessionPlugin: FastifyPluginAsync = fp(async (app) => {
  app.addHook('onRequest', async (request, reply) => {
    // CSRF protection
    if (!apiConfig.env.DEV && !apiConfig.env.TEST) {
      const origin = request.headers['origin'] as string | undefined
      // The Origin could also be compared against the Host or X-Forwarded-Host header.
      if (!origin || !apiConfig.allowedOrigins.includes(origin)) {
        return reply.code(403).send({ message: 'Unexpected origin' })
      }
    }

    // Validate session
    const token = parseSessionTokenFromCookie(request)

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
  async (app) => {
    app.addHook('onRequest', (request, reply, done) => {
      if (!request.user) {
        reply.code(401).send({ message: 'Unauthorized' })
      }

      done()
    })
  },
)
