import type { FastifyBaseLogger } from 'fastify'
import pino from 'pino'
import apiConfig from '#config/api.ts'

export function createLogger() {
  // Override to fix type error due to ESM import
  // More info: https://github.com/fastify/fastify/issues/5734
  return pino(apiConfig.logger) as unknown as FastifyBaseLogger
}
