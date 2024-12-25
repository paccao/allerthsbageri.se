import { FastifyReply, FastifyRequest } from 'fastify'

import { SignUpBody } from './auth.schemas.ts'
import { signUpUser } from './auth.service.ts'
import { lucia } from '@/utils/session.ts'

// TODO: improve the boundary between controller and service
// Let the service perform DB operations, one at a time
// Handle errors and define the logic flow in the controller

export async function signUpHandler(
  request: FastifyRequest<{ Body: SignUpBody }>,
  reply: FastifyReply,
) {
  if (request.user) return reply.code(400)

  const { name, username, password } = request.body
  try {
    const { sessionCookie, error, status } = await signUpUser(
      username,
      password,
    )
    if (!sessionCookie) {
      return reply.code(status ?? 500).send(error)
    }

    reply.header('Set-Cookie', sessionCookie.serialize())
  } catch (e: any) {
    request.log.error(e, e?.message)
    reply.code(500)
  }
}

// export async function signInHandler(
//   request: FastifyRequest<{ Body: SignInBody }>,
//   reply: FastifyReply,
// ) {
//   if (request.user) return reply.code(400)

//   const { username, password } = request.body

//   try {
//     const { sessionCookie, error, status } = await signInUser(
//       username,
//       password,
//     )
//     if (!sessionCookie) {
//       return reply.code(status).send(error)
//     }

//     reply.header('Set-Cookie', sessionCookie.serialize())
//   } catch (e: any) {
//     request.log.error(e, e?.message)
//     reply.code(500)
//   }
// }

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
