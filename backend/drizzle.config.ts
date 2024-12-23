import { defineConfig } from 'drizzle-kit'
import apiConfig from './src/config/api.ts'

export default defineConfig({
  dialect: 'sqlite',
  out: './migrations',
  schema: './src/db/schema.ts',
  dbCredentials: { url: apiConfig.dbConnection },
  breakpoints: false,
})
