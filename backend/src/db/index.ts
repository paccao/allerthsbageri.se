import { drizzle } from 'drizzle-orm/better-sqlite3'

import apiConfig from '#config/api.ts'
import * as schema from '#db/schema.ts'

export const db = drizzle({
  connection: { source: apiConfig.dbConnection },
  casing: 'snake_case',
  schema,
})
