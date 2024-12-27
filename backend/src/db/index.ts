import { drizzle } from 'drizzle-orm/libsql'

import apiConfig from '../config/api.ts'

export const db = drizzle({
  connection: { url: apiConfig.dbConnection },
  casing: 'snake_case',
})
