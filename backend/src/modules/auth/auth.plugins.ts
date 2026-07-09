import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

import { userTable, type User } from '#db/schema.js'
import apiConfig from '#config/api.js'
import env from '#config/env.js'
import { eq } from 'drizzle-orm'

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
  let bffServiceUser: { id: number } | undefined
  app.addHook('onRequest', async (request, reply) => {
    // CSRF protection
    if (!apiConfig.env.DEV && !apiConfig.env.TEST) {
      const origin = request.headers['origin'] as string | undefined
      // The Origin could also be compared against the Host or X-Forwarded-Host header.
      if (!origin || !apiConfig.allowedOrigins.includes(origin)) {
        return reply.code(403).send({ message: 'Unexpected origin' })
      }
    }

    const bffApiKey = request.headers['bff_api_key']

    if (bffApiKey) {
      if (bffApiKey !== env.BFF_API_KEY) {
        return reply.code(401)
      }

      // The frontend server authenticates via an api key
      // We have a special service account for the frontend server created in db seed
      if (bffApiKey === env.BFF_API_KEY) {
        if (!bffServiceUser) {
          const serviceUsers = await app.diContainer.db
            .select({ id: userTable.id })
            .from(userTable)
            .where(eq(userTable.username, env.BFF_ADMIN_USERNAME))
          if (serviceUsers.length === 1) {
            bffServiceUser = serviceUsers[0]
          } else {
            throw new Error(
              'Unexpected amount of BFF service account users ' + serviceUsers,
            )
          }
        }

        request.user = bffServiceUser

        // Exit early to prevent other auth logic
        return
      }
    }

    const { sessionService } = app.diContainer

    // Validate session
    const token = sessionService.parseSessionTokenFromCookie(request)

    if (token) {
      const { session, user, refreshed } =
        await sessionService.validateSessionToken(token)
      if (session) {
        request.user = user

        if (refreshed) {
          sessionService.setSessionTokenCookie(reply, token, session.expiresAt)
        }
      } else {
        sessionService.deleteSessionTokenCookie(reply)
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
