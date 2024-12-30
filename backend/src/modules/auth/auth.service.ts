import { hash, verify } from '@node-rs/argon2'

import { db } from '#db/index.ts'
import { userTable } from '#db/schema.ts'
import { eq } from 'drizzle-orm'
import apiConfig from '#config/api.ts'

export async function signUpUser({
  username,
  password,
  name,
}: typeof userTable.$inferInsert) {
  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username))

  if (existingUser?.username == username) {
    return { error: 'Username already taken', status: 422 }
  }

  const hashedPassword = await hash(password, apiConfig.passwordHashingConfig)

  const [newUser] = await db
    .insert(userTable)
    .values({
      username,
      password: hashedPassword,
      name,
    })
    .returning({ id: userTable.id })

  if (!newUser) {
    return { error: 'Failed to create user', status: 500 }
  }

  return { user: newUser }
}

export async function signInUser(username: string, password: string) {
  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username))

  const isValidPassword =
    existingUser &&
    (await verify(
      existingUser.password,
      password,
      apiConfig.passwordHashingConfig,
    ))

  if (!existingUser || !isValidPassword) {
    return { error: 'Invalid username or password', status: 422 }
  }

  return { user: existingUser }
}

// export async function signOutUser(sessionId: string) {
//   await lucia.invalidateSession(sessionId)

//   return lucia.createBlankSessionCookie()
// }
