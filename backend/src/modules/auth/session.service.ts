import { eq } from 'drizzle-orm'
import cookie from 'cookie'
import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  userTable as userTable,
  sessionTable as sessionTable,
  type User,
  type Session,
} from '#db/schema.ts'
import apiConfig from '#config/api.ts'
import type { DependencyContainer } from '#src/di-container.ts'

const DAY = 1000 * 60 * 60 * 24

// IDEA: Maybe use a cleaner API for session?:
// session.create()
// session.deleteCookie()
// session.invalidate()
// session.parseCookie()
// session.setCookie()
export class SessionService {
  #db: DependencyContainer['db']

  constructor(db: DependencyContainer['db']) {
    this.#db = db
  }

  generateSessionToken() {
    return crypto.randomUUID()
  }

  async createSession(token: string, userId: number): Promise<Session> {
    const sessionId = await getSHA256Hash(token)
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 30 * DAY),
    }
    await this.#db.insert(sessionTable).values(session)
    return session
  }

  parseSessionTokenFromCookie(request: FastifyRequest) {
    const cookies = cookie.parse(
      (request.headers['cookie'] as string | undefined) ?? '',
    )
    return cookies[apiConfig.sessionCookieName]
  }

  async validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = await getSHA256Hash(token)
    let refreshed = false

    const result = await this.#db
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
      await this.#db.delete(sessionTable).where(eq(sessionTable.id, session.id))
      return { session: null, user: null, refreshed }
    }

    // Renew session if it's getting close to expiration
    if (Date.now() >= session.expiresAt.getTime() - 15 * DAY) {
      session.expiresAt = new Date(Date.now() + 30 * DAY)
      await this.#db
        .update(sessionTable)
        .set({ expiresAt: session.expiresAt })
        .where(eq(sessionTable.id, session.id))
      refreshed = true
    }
    return { session, user, refreshed }
  }

  async invalidateSession(token: string): Promise<void> {
    const sessionId = await getSHA256Hash(token)
    await this.#db.delete(sessionTable).where(eq(sessionTable.id, sessionId))
  }

  setSessionTokenCookie(
    reply: FastifyReply,
    token: string,
    expiresAt: Date,
  ): void {
    const cookie = `${apiConfig.sessionCookieName}=${token}; HttpOnly; SameSite=Strict; Expires=${expiresAt.toISOString()}; Path=/;`

    reply.header('Set-Cookie', apiConfig.env.DEV ? cookie : cookie + ' Secure;')
  }

  deleteSessionTokenCookie(reply: FastifyReply): void {
    const cookie = `${apiConfig.sessionCookieName}=; HttpOnly; SameSite=Strict; Max-Age=0; Path=/;`

    reply.header('Set-Cookie', apiConfig.env.DEV ? cookie : cookie + ' Secure;')
  }
}

export type SessionValidationResult =
  | { session: Session; user: Omit<User, 'password'>; refreshed: boolean }
  | { session: null; user: null; refreshed: false }

const encoder = new TextEncoder()

async function getSHA256Hash(input: string) {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(input),
  )

  return Array.from(new Uint8Array(hashBuffer))
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('')
}
