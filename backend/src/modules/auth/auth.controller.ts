import { FastifyReply, FastifyRequest } from 'fastify'

import { SignInBody, SignUpBody } from './auth.schemas.ts'
import { signInUser, signUpUser } from './auth.service.ts'
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from '@/utils/session.ts'

// TODO: improve the boundary between controller and service
// Let the service perform DB operations, one at a time
// Handle errors and define the logic flow in the controller

export async function signUpHandler(
  request: FastifyRequest<{ Body: SignUpBody }>,
  reply: FastifyReply,
) {
  // No need to sign up if already authenticated
  if (request.user) return reply.code(400)

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
  if (request.user) return reply.code(400)

  const { username, password } = request.body

  try {
    const { user, error, status } = await signInUser(username, password)
    if (!user) {
      return reply.code(status).send(error)
    }

    const token = generateSessionToken()
    const session = await createSession(token, user.id)
    setSessionTokenCookie(reply, token, session.expiresAt)
  } catch (e: any) {
    request.log.error(e, e?.message)
    reply.code(500)
  }
}

// export async function signOutHandler(
//   request: FastifyRequest,
//   reply: FastifyReply,
// ) {
//   const sessionId = lucia.readSessionCookie(request.headers.cookie ?? '')
//   if (!sessionId) {
//     return reply.code(401)
//   }

//   try {
//     const sessionCookie = await signOutUser(sessionId)
//     reply.header('Set-Cookie', sessionCookie.serialize())
//   } catch (e: any) {
//     request.log.error(e, e?.message)
//     reply.code(500)
//   }
// }
