import { eq } from 'drizzle-orm'
import cookie from 'cookie'
import { db } from '#db/index.ts'
import {
  userTable as userTable,
  sessionTable as sessionTable,
  type User,
  type Session,
} from '#db/schema.ts'
import apiConfig from '#config/api.ts'
import { getSHA256Hash } from './crypto.ts'
import type { FastifyReply, FastifyRequest } from 'fastify'

const DAY = 1000 * 60 * 60 * 24

export function generateSessionToken() {
  return crypto.randomUUID()
}

export async function createSession(
  token: string,
  userId: number,
): Promise<Session> {
  const sessionId = await getSHA256Hash(token)
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 30 * DAY),
  }
  await db.insert(sessionTable).values(session)
  return session
}

export function parseSessionTokenFromCookie(request: FastifyRequest) {
  const cookies = cookie.parse(
    (request.headers['cookie'] as string | undefined) ?? '',
  )
  return cookies[apiConfig.sessionCookieName]
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = await getSHA256Hash(token)
  let refreshed = false

  const result = await db
    .select({
      user: {
        id: userTable.id,
        name: userTable.name,
        username: userTable.username,
      },
      session: sessionTable,
    })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId))

  if (result[0] === undefined) {
    return { session: null, user: null, refreshed }
  }
  const { user, session } = result[0]

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id))
    return { session: null, user: null, refreshed }
  }

  // Renew session if it's getting close to expiration
  if (Date.now() >= session.expiresAt.getTime() - 15 * DAY) {
    session.expiresAt = new Date(Date.now() + 30 * DAY)
    await db
      .update(sessionTable)
      .set({ expiresAt: session.expiresAt })
      .where(eq(sessionTable.id, session.id))
    refreshed = true
  }
  return { session, user, refreshed }
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId))
}

export function setSessionTokenCookie(
  reply: FastifyReply,
  token: string,
  expiresAt: Date,
): void {
  const cookie = `${apiConfig.sessionCookieName}=${token}; HttpOnly; SameSite=Strict; Expires=${expiresAt.toISOString()}; Path=/;`

  reply.header('Set-Cookie', apiConfig.env.DEV ? cookie : cookie + ' Secure;')
}

export function deleteSessionTokenCookie(reply: FastifyReply): void {
  const cookie = `${apiConfig.sessionCookieName}=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/;`

  reply.header('Set-Cookie', apiConfig.env.DEV ? cookie : cookie + ' Secure;')
}

export type SessionValidationResult =
  | { session: Session; user: Omit<User, 'password'>; refreshed: boolean }
  | { session: null; user: null; refreshed: false }
