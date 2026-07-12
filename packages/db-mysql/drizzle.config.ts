/**
 * Drizzle Kit configuration for @book000/pixivts-db-mysql.
 *
 * Usage:
 *   pnpm drizzle-kit generate  # generate migrations
 *   pnpm drizzle-kit migrate   # apply migrations
 *   pnpm drizzle-kit studio    # open Drizzle Studio
 */

import { defineConfig } from 'drizzle-kit'

// process is a Node.js global. @types/node is not available in the default
// TypeScript project used for this file (it is outside tsconfig include), so
// we cast to a minimal shape to satisfy ESLint's type-aware rules.
const environment = (
  process as unknown as { env: Record<string, string | undefined> }
).env

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: environment.RESPONSE_DB_HOSTNAME ?? 'localhost',
    port: Number(environment.RESPONSE_DB_PORT ?? '3306'),
    user: environment.RESPONSE_DB_USERNAME ?? 'root',
    password: environment.RESPONSE_DB_PASSWORD ?? '',
    database: environment.RESPONSE_DB_DATABASE ?? 'pixivts',
  },
})
