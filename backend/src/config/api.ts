import { FastifyServerOptions } from 'fastify'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.number().default(3000),
  HOST: z.string().default('localhost'),
  NODE_ENV: z.enum(['development', 'production']).default('production'),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string().min(48),
})

const env = envSchema.parse(process.env)

const baseLoggerOptions: FastifyServerOptions['logger'] = {
  redact: ['DATABASE_URL'],
}

const apiConfig: {
  port: number
  host: string
  logger: FastifyServerOptions['logger']
  dbConnection: string
  sessionSecret: string
} = {
  port: env.PORT,
  host: env.HOST,
  logger:
    env.NODE_ENV === 'development' && process.stdout.isTTY
      ? {
          level: 'trace',
          transport: { target: 'pino-pretty' },
          ...baseLoggerOptions,
        }
      : { level: 'info', ...baseLoggerOptions },
  dbConnection: env.DATABASE_URL,
  sessionSecret: env.SESSION_SECRET,
}

export default apiConfig
