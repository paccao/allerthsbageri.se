import { defineConfig } from 'drizzle-kit'
import apiConfig from './src/config/api.js'

export default defineConfig({
  dialect: 'sqlite',
  out: './migrations',
  schema: './src/db/schema.ts',
  dbCredentials: { url: apiConfig.dbConnection },
  breakpoints: false,
  casing: 'snake_case',
})
