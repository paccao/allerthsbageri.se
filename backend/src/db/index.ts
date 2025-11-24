import { drizzle } from 'drizzle-orm/better-sqlite3'

import apiConfig from '#config/api.ts'
import * as schema from '#db/schema.ts'

export const db = drizzle({
  connection: { source: apiConfig.dbConnection },
  casing: 'snake_case',
  schema,
  // This can be useful to debug SQL statements run against the DB
  // logger: {
  //   logQuery(query, params) {
  //     console.dir({ query, params })
  //   },
  // },
})
