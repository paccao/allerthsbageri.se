import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().default(3000),
  HOST: z.string().default('localhost'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string().default('data.db'),
  SESSION_COOKIE_NAME: z.string().default('session'),
  OPENAPI_PREFIX: z.string().min(1).default('api/docs'),
})

const env = envSchema.parse(process.env)

export const DEV = env.NODE_ENV === 'development'
export const PROD = env.NODE_ENV === 'production'

export default env
