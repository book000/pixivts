/**
 * Drizzle Kit configuration for @book000/pixivts-db-mysql.
 *
 * Usage:
 *   pnpm drizzle-kit generate  # generate migrations
 *   pnpm drizzle-kit migrate   # apply migrations
 *   pnpm drizzle-kit studio    # open Drizzle Studio
 */

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env['RESPONSE_DB_HOSTNAME'] ?? 'localhost',
    port: parseInt(process.env['RESPONSE_DB_PORT'] ?? '3306', 10),
    user: process.env['RESPONSE_DB_USERNAME'] ?? 'root',
    password: process.env['RESPONSE_DB_PASSWORD'] ?? '',
    database: process.env['RESPONSE_DB_DATABASE'] ?? 'pixivts',
  },
})
