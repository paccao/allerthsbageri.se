import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().default(3000),
  HOST: z.string().default('localhost'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string().default('data.db'),
  SESSION_COOKIE_NAME: z.string().default('session'),
  OPENAPI_PREFIX: z.string().min(1).default('api/docs'),
  BFF_ADMIN_USERNAME: z.string().min(1),
  BFF_ADMIN_PASSWORD: z.string().min(1),
  BFF_API_KEY: z.string().min(1).max(64),
})

const env = envSchema.parse(process.env)

export const DEV = env.NODE_ENV === 'development'
export const TEST = env.NODE_ENV === 'test'

export default env
