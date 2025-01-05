import { type Options } from '@node-rs/argon2'
import { type FastifyServerOptions } from 'fastify'

import env, { DEV, TEST } from './env.ts'

const baseLoggerOptions: FastifyServerOptions['logger'] = {
  // TODO: Redact all sensitive data
  redact: ['DATABASE_URL', 'SESSION_SECRET', 'req.headers.cookie'],
}

const apiConfig = {
  port: env.PORT,
  host: env.HOST,
  env: {
    DEV,
    TEST,
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
