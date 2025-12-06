import type { FastifyReply, FastifyRequest } from 'fastify'

import type { SignInBody, SignUpBody } from './auth.schemas.ts'
import type { DependencyContainer } from '#src/di-container.ts'

export function createAuthController(
  sessionService: DependencyContainer['sessionService'],
  authService: DependencyContainer['authService'],
) {
  async function signUpHandler(
    request: FastifyRequest<{ Body: SignUpBody }>,
    reply: FastifyReply,
  ) {
    // No need to sign up if already authenticated
    if (request.user) {
      return reply.code(400).send({ message: 'Already signed in' })
    }

    const { name, username, password } = request.body
    try {
      const { user, error, status } = await authService.signUpUser({
        username,
        password,
        name,
      })
      if (!user) {
        return reply.code(status ?? 500).send({ message: error })
      }

      const token = sessionService.generateSessionToken()
      const session = await sessionService.createSession(token, user.id)
      sessionService.setSessionTokenCookie(reply, token, session.expiresAt)
    } catch (e: any) {
      request.log.error(e, e?.message)
      reply.code(500).send({ message: 'Failed to create user' })
    }
  }

  async function signInHandler(
    request: FastifyRequest<{ Body: SignInBody }>,
    reply: FastifyReply,
  ) {
    if (request.user)
      return reply.code(400).send({ message: 'Already signed in' })

    const { username, password } = request.body

    try {
      const { user, error, status } = await authService.signInUser(
        username,
        password,
      )
      if (!user) {
        request.log.error(error)
        return reply.code(status).send({ message: error })
      }

      const token = sessionService.generateSessionToken()
      const session = await sessionService.createSession(token, user.id)
      sessionService.setSessionTokenCookie(reply, token, session.expiresAt)
    } catch (e: any) {
      request.log.error(e, e?.message)
      reply.code(500).send({ message: 'Failed to sign in' })
    }
  }

  async function signOutHandler(request: FastifyRequest, reply: FastifyReply) {
    const token = sessionService.parseSessionTokenFromCookie(request)
    if (token) {
      try {
        await sessionService.invalidateSession(token)
        sessionService.deleteSessionTokenCookie(reply)
      } catch (e: any) {
        request.log.error(e, e?.message)
        reply.code(500).send({ message: 'Failed to sign out' })
      }
    }
  }

  return {
    signUpHandler,
    signInHandler,
    signOutHandler,
  }
}
