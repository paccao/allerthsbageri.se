import { FastifyServerOptions } from 'fastify'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().default(3000),
  HOST: z.string().default('localhost'),
  NODE_ENV: z.enum(['development', 'production']).default('production'),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string().min(48),
  OPENAPI_PREFIX: z.string().min(1).default('api/docs'),
})

const env = envSchema.parse(process.env)

const baseLoggerOptions: FastifyServerOptions['logger'] = {
  // TODO: Redact all sensitive data
  redact: ['DATABASE_URL', 'SESSION_SECRET'],
}

const DEV = env.NODE_ENV === 'development'
const PROD = env.NODE_ENV === 'production'

const apiConfig = {
  port: env.PORT,
  host: env.HOST,
  env: {
    DEV,
    PROD,
  },
  allowedOrigins: DEV
    ? ['http://localhost:4321']
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
  sessionSecret: env.SESSION_SECRET,
  openAPIPrefix: env.OPENAPI_PREFIX,
}

export default apiConfig
