import { FastifyReply, FastifyRequest } from 'fastify'

import { SignInBody, SignUpBody } from './auth.schemas.ts'
import { signInUser, signUpUser } from './auth.service.ts'
import {
  createSession,
  deleteSessionTokenCookie,
  generateSessionToken,
  invalidateSession,
  parseSessionTokenFromCookie,
  setSessionTokenCookie,
} from '@/utils/session.ts'
import { getSHA256Hash } from '@/utils/crypto.ts'

// TODO: improve the boundary between controller and service
// Let the service perform DB operations, one at a time
// Handle errors and define the logic flow in the controller

export async function signUpHandler(
  request: FastifyRequest<{ Body: SignUpBody }>,
  reply: FastifyReply,
) {
  // No need to sign up if already authenticated
  if (request.user)
    return reply.code(400).send({ message: 'Already signed in' })

  const { name, username, password } = request.body
  try {
    const { user, error, status } = await signUpUser({
      username,
      password,
      name,
    })
    if (!user) {
      return reply.code(status ?? 500).send({ message: error })
    }

    const token = generateSessionToken()
    const session = await createSession(token, user.id)
    setSessionTokenCookie(reply, token, session.expiresAt)
  } catch (e: any) {
    request.log.error(e, e?.message)
    reply.code(500).send({ message: 'Failed to create user' })
  }
}

export async function signInHandler(
  request: FastifyRequest<{ Body: SignInBody }>,
  reply: FastifyReply,
) {
  if (request.user)
    return reply.code(400).send({ message: 'Already signed in' })

  const { username, password } = request.body

  try {
    const { user, error, status } = await signInUser(username, password)
    if (!user) {
      request.log.error(error)
      return reply.code(status).send({ message: error })
    }

    const token = generateSessionToken()
    const session = await createSession(token, user.id)
    setSessionTokenCookie(reply, token, session.expiresAt)
  } catch (e: any) {
    request.log.error(e, e?.message)
    reply.code(500).send({ message: 'Failed to sign in' })
  }
}

export async function signOutHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const token = parseSessionTokenFromCookie(request)
  if (token) {
    try {
      const sessionId = await getSHA256Hash(token)
      await invalidateSession(sessionId)
      deleteSessionTokenCookie(reply)
    } catch (e: any) {
      request.log.error(e, e?.message)
      reply.code(500).send({ message: 'Failed to sign out' })
    }
  }
}
