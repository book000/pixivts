/**
 * MySQL connection factory for @book000/pixivts-db-mysql.
 *
 * Creates a mysql2 connection pool and wraps it in a Drizzle ORM instance.
 */

import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

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
export type DatabaseInstance = ReturnType<typeof drizzle<typeof schema>>

/**
 * @deprecated Use {@link DatabaseInstance} instead. Kept as a type alias for
 * backward compatibility with the pre-1.x `DbInstance` naming (renamed to
 * `DatabaseInstance` to satisfy the `unicorn/name-replacements` lint rule).
 */
export type DbInstance = DatabaseInstance

function parsePort(value: string | undefined): number {
  if (!value) return 3306
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 3306 : parsed
}

/**
 * Creates a mysql2 connection pool and returns both the raw pool and the
 * Drizzle ORM wrapper.
 *
 * @param options - Connection options (fall back to environment variables)
 * @returns `{ pool, db }` — raw pool for `close()`, db for queries
 */
export function createDatabaseConnection(options: ConnectionOptions): {
  pool: mysql.Pool
  db: DatabaseInstance
} {
  const pool = mysql.createPool({
    host: options.host ?? process.env.RESPONSE_DB_HOSTNAME ?? 'localhost',
    port: options.port ?? parsePort(process.env.RESPONSE_DB_PORT),
    user: options.user ?? process.env.RESPONSE_DB_USERNAME,
    password: options.password ?? process.env.RESPONSE_DB_PASSWORD,
    database: options.database ?? process.env.RESPONSE_DB_DATABASE,
    timezone: '+09:00',
    supportBigNumbers: true,
    bigNumberStrings: true,
  })

  // Type assertion required: pnpm's peer-dep resolution for the patched drizzle-orm
  // creates a structurally-incompatible Pool type for the $client property.
  // The runtime value is correct; only the declaration paths differ.
  const database = drizzle(pool, {
    schema,
    mode: 'default',
  }) as unknown as DatabaseInstance
  return { pool, db: database }
}

/**
 * @deprecated Use {@link createDatabaseConnection} instead. Kept as a wrapper
 * for backward compatibility with the pre-1.x `createDbConnection` naming
 * (renamed to satisfy the `unicorn/name-replacements` lint rule).
 */
export function createDbConnection(options: ConnectionOptions): {
  pool: mysql.Pool
  db: DatabaseInstance
} {
  return createDatabaseConnection(options)
}
