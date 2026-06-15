/**
 * MySQL connection factory for @book000/pixivts-db-mysql.
 *
 * Creates a mysql2 connection pool and wraps it in a Drizzle ORM instance.
 */

import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema.js'

/** Options for establishing a MySQL connection. */
export interface ConnectionOptions {
  /**
   * Database hostname.
   * Falls back to the `RESPONSE_DB_HOSTNAME` environment variable.
   */
  host?: string

  /**
   * Database port.
   * Falls back to the `RESPONSE_DB_PORT` environment variable (default: 3306).
   */
  port?: number

  /**
   * Database username.
   * Falls back to the `RESPONSE_DB_USERNAME` environment variable.
   */
  user?: string

  /**
   * Database password.
   * Falls back to the `RESPONSE_DB_PASSWORD` environment variable.
   */
  password?: string

  /**
   * Database name.
   * Falls back to the `RESPONSE_DB_DATABASE` environment variable.
   */
  database?: string
}

/**
 * The Drizzle ORM database instance type returned by `createConnection`.
 *
 * Typed with the `schema` so that relational queries are available.
 */
export type DbInstance = ReturnType<typeof drizzle<typeof schema>>

/**
 * Creates a mysql2 connection pool and returns both the raw pool and the
 * Drizzle ORM wrapper.
 *
 * @param opts - Connection options (fall back to environment variables)
 * @returns `{ pool, db }` — raw pool for `close()`, db for queries
 */
export function createDbConnection(opts: ConnectionOptions): {
  pool: mysql.Pool
  db: DbInstance
} {
  const pool = mysql.createPool({
    host: opts.host ?? process.env['RESPONSE_DB_HOSTNAME'] ?? 'localhost',
    port: opts.port ?? parsePort(process.env['RESPONSE_DB_PORT']),
    user: opts.user ?? process.env['RESPONSE_DB_USERNAME'],
    password: opts.password ?? process.env['RESPONSE_DB_PASSWORD'],
    database: opts.database ?? process.env['RESPONSE_DB_DATABASE'],
    timezone: '+09:00',
    supportBigNumbers: true,
    bigNumberStrings: true,
  })

  // Type assertion required: pnpm's peer-dep resolution for the patched drizzle-orm
  // creates a structurally-incompatible Pool type for the $client property.
  // The runtime value is correct; only the declaration paths differ.
  const db = drizzle(pool, { schema, mode: 'default' }) as unknown as DbInstance
  return { pool, db }
}

function parsePort(value: string | undefined): number {
  if (!value) return 3306
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? 3306 : parsed
}
