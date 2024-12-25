import { hash, verify, Options } from '@node-rs/argon2'

import { createSession, generateSessionToken } from '@/utils/session.ts'
import { db } from '@/db/index.ts'
import { userTable } from '@/db/schema.ts'
import { eq } from 'drizzle-orm'

/**
 * OWASP recommendations:
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
const hashConfig: Options = {
  memoryCost: 19456,
  timeCost: 3,
  outputLen: 32,
  parallelism: 1,
}

export async function signUpUser(
  username: string,
  password: string,
  name: string,
) {
  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username))

  if (existingUser?.username == username) {
    return { error: 'Username already taken', status: 422 }
  }

  const hashedPassword = await hash(password, hashConfig)

  const [newUser] = await db
    .insert(userTable)
    .values({ username, password: hashedPassword, name })
    .returning({ id: userTable.id })

  if (!newUser) {
    // NOTE: Log error here
    return { error: 'Failed creating user', status: 500 }
  }

  const token = generateSessionToken()
  const session = createSession(token, newUser.id)

  return { sessionCookie: lucia.createSessionCookie(session.id) }
}

// export async function signInUser(username: string, password: string) {
//   const existingUser = await prisma.user.findUnique({
//     where: { username },
//   })
//   if (!existingUser) {
//     return { error: 'Invalid username or password', status: 422 }
//   }

//   const isValidPassword = await verify(
//     existingUser.hashedPassword,
//     password,
//     hashConfig,
//   )
//   if (!isValidPassword) {
//     return { error: 'Invalid username or password', status: 422 }
//   }

//   // TODO: Check if a valid session exists before creating a new one

//   const session = await lucia.createSession(existingUser.id, {})
//   return { sessionCookie: lucia.createSessionCookie(session.id) }
// }

// export async function signOutUser(sessionId: string) {
//   await lucia.invalidateSession(sessionId)

//   return lucia.createBlankSessionCookie()
// }
