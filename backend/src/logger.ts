import pino from 'pino'
import apiConfig from '#config/api.ts'

export function createLogger() {
  return pino(apiConfig.logger)
}
