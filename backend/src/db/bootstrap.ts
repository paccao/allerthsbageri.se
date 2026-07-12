import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import env from '#config/env.js'
import * as schema from './schema.js'
import { addSeedingData } from './seed.js'

const sqlite = new Database(env.DATABASE_URL)
const db = drizzle(sqlite, { schema })

await migrate(db, { migrationsFolder: '/app/migrations' }) // production path
await addSeedingData(db)

sqlite.close()
