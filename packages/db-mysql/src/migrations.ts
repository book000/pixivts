/**
 * Schema bootstrapping for @book000/pixivts-db-mysql.
 *
 * Provides a `CREATE TABLE IF NOT EXISTS` helper that can be used at startup
 * without requiring drizzle-kit to be installed in production.
 *
 * For full migrations, use:
 *   pnpm drizzle-kit generate
 *   pnpm drizzle-kit migrate
 */

import { sql } from 'drizzle-orm'
import type { DbInstance } from './connection.js'

/**
 * Creates the `responses` table if it does not already exist.
 *
 * This is a lightweight alternative to running drizzle-kit migrations in
 * environments where the table has not been set up yet.
 *
 * @param db - Drizzle ORM database instance
 */
export async function bootstrapSchema(db: DbInstance): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS responses (
      id           INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Response ID',
      method       VARCHAR(10)   NOT NULL COMMENT 'HTTP method',
      endpoint     VARCHAR(255)  NOT NULL COMMENT 'API endpoint path',
      url          TEXT          NULL     COMMENT 'Full request URL',
      url_hash     VARCHAR(255)  NOT NULL COMMENT 'SHA-256 hash of the request URL',
      request_headers  LONGTEXT  NULL     COMMENT 'Request headers (JSON)',
      request_body     LONGTEXT  NULL     COMMENT 'Request body',
      response_type    VARCHAR(10) NOT NULL COMMENT 'Response content type',
      status_code      INT         NOT NULL COMMENT 'HTTP status code',
      response_headers LONGTEXT   NULL     COMMENT 'Response headers (JSON)',
      response_body    LONGTEXT   NOT NULL COMMENT 'Response body',
      created_at       DATETIME(3) NOT NULL COMMENT 'Record creation timestamp',
      UNIQUE INDEX idx_unique (method, endpoint, status_code, created_at, url_hash)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
}
