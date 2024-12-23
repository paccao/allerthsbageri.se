import { sqliteTable, int, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
})
