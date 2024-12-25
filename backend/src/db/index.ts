import { drizzle } from 'drizzle-orm/better-sqlite3'

import apiConfig from '../config/api.ts'

export const db = drizzle({
  connection: apiConfig.dbConnection,
  casing: 'snake_case',
})
