import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../../keystatic.config'

/** See https://keystatic.com/docs/reader-api */
export const reader = createReader(process.cwd(), keystaticConfig)
