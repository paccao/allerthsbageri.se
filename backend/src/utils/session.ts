import { eq } from 'drizzle-orm'
import { db } from '@/db/index.ts'
import {
  userTable as userTable,
  sessionTable as sessionTable,
  User,
  Session,
} from '@/db/schema.ts'
import { getSHA256Hash } from './crypto.ts'

const ONE_DAY = 1000 * 60 * 60 * 24

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
    expiresAt: new Date(Date.now() + 30 * ONE_DAY),
  }
  await db.insert(sessionTable).values(session)
  return session
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = await getSHA256Hash(token)
  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId))

  if (result[0] === undefined) {
    return { session: null, user: null }
  }
  const { user, session } = result[0]

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id))
    return { session: null, user: null }
  }
  if (Date.now() >= session.expiresAt.getTime() - 15 * ONE_DAY) {
    session.expiresAt = new Date(Date.now() + 30 * ONE_DAY)
    await db
      .update(sessionTable)
      .set({ expiresAt: session.expiresAt })
      .where(eq(sessionTable.id, session.id))
  }
  return { session, user }
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId))
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null }
