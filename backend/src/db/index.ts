import { drizzle } from 'drizzle-orm/better-sqlite3'

import apiConfig from '#config/api.ts'
import * as schema from '#db/schema.ts'

export function createDBConnection() {
  return drizzle({
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
}

/**
 * Typed transaction which is mapped to our DB schema
 */
export type Transaction = Parameters<
  Parameters<ReturnType<typeof createDBConnection>['transaction']>[0]
>[0]
