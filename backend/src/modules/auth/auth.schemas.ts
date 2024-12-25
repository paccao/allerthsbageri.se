import { z } from 'zod'

const usernameRegex = /^[0-9A-Za-z\._]+$/
const username = z.string().min(6).max(20).regex(usernameRegex)
const password = z.string().min(6).max(100)

export const signUpBodySchema = z.object({
  name: z.string().max(200),
  username,
  password,
})
export type SignUpBody = z.infer<typeof signUpBodySchema>

export const signUpJSONSchema = {
  body: signUpBodySchema,
}

export const signInBodySchema = z.object({
  username,
  password,
})
export type SignInBody = z.infer<typeof signInBodySchema>

export const signInJSONSchema = {
  body: signInBodySchema,
}
