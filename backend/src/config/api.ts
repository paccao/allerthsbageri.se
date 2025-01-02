import { type Options } from '@node-rs/argon2'
import { type FastifyServerOptions } from 'fastify'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().default(3000),
  HOST: z.string().default('localhost'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string().default('dev.db'),
  SESSION_COOKIE_NAME: z.string().default('session'),
  OPENAPI_PREFIX: z.string().min(1).default('api/docs'),
})

const env = envSchema.parse(process.env)

const baseLoggerOptions: FastifyServerOptions['logger'] = {
  // TODO: Redact all sensitive data
  redact: ['DATABASE_URL', 'SESSION_SECRET'],
}

const DEV = env.NODE_ENV === 'development'
const PROD = env.NODE_ENV === 'production'

const openAPITags = {
  auth: {
    description: 'Authentication and user account',
  },
  pickups: {
    description:
      'Pickup occasions, where customers receive their ordered products',
  },
  customers: {
    description: 'Customers who order products or activities',
  },
  orders: {
    description: 'Customer orders',
  },
} as const

type TagName = keyof typeof openAPITags
type Tag = (typeof openAPITags)[TagName] & { name: TagName }

const apiConfig = {
  port: env.PORT,
  host: env.HOST,
  env: {
    DEV,
    PROD,
  },
  allowedOrigins: DEV
    ? ['http://localhost:4321', 'http://localhost:3000']
    : ['https://allerthsbageri.se'],
  logger: (DEV && process.stdout.isTTY
    ? {
        level: 'trace',
        transport: { target: 'pino-pretty' },
        ...baseLoggerOptions,
      }
    : {
        level: 'info',
        ...baseLoggerOptions,
      }) as FastifyServerOptions['logger'],
  dbConnection: env.DATABASE_URL,
  sessionCookieName: env.SESSION_COOKIE_NAME,

  openAPIPrefix: env.OPENAPI_PREFIX,
  openAPITags: Object.entries(openAPITags).reduce(
    (tags, [name, tag]) => {
      const tagName = name as unknown as TagName
      tags[tagName] = { name: tagName, ...tag }
      return tags
    },
    {} as Record<TagName, Tag>,
  ),

  /**
   * OWASP recommendations:
   * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
   */
  passwordHashingConfig: {
    memoryCost: 19456,
    timeCost: 3,
    outputLen: 32,
    parallelism: 1,
  } as Options,
}

export default apiConfig
