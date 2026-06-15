/**
 * Drizzle ORM schema for the `responses` table.
 *
 * Column names are kept in snake_case to match the legacy TypeORM schema
 * so that existing databases can be used without migration.
 */

import {
  int,
  datetime,
  longtext,
  mysqlTable,
  text,
  varchar,
  uniqueIndex,
} from 'drizzle-orm/mysql-core'

/**
 * The `responses` table stores every HTTP response returned by the pixiv API.
 *
 * A unique composite index on (method, endpoint, status_code, created_at, url_hash)
 * prevents duplicate records for the same request/response pair within a
 * sub-millisecond window.
 */
export const responsesTable = mysqlTable(
  'responses',
  {
    /** Auto-increment primary key. */
    id: int('id').autoincrement().primaryKey(),
    /** HTTP method (GET or POST). */
    method: varchar('method', { length: 10 }).notNull(),
    /** API endpoint path (e.g. /v1/illust/detail). */
    endpoint: varchar('endpoint', { length: 255 }).notNull(),
    /** Full request URL (may be null for internal requests). */
    url: text('url'),
    /** SHA-256 hash of the request URL for deduplication. */
    urlHash: varchar('url_hash', { length: 255 }).notNull(),
    /** Serialised request headers (JSON string). */
    requestHeaders: longtext('request_headers'),
    /** Request body (URL-encoded string for POST, null for GET). */
    requestBody: longtext('request_body'),
    /** Response content type ("JSON" or "TEXT"). */
    responseType: varchar('response_type', { length: 10 }).notNull(),
    /** HTTP response status code. */
    statusCode: int('status_code').notNull(),
    /** Serialised response headers (JSON string). */
    responseHeaders: longtext('response_headers'),
    /** Raw response body. */
    responseBody: longtext('response_body').notNull(),
    /** Timestamp when the record was created. */
    createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull(),
  },
  (table) => [
    uniqueIndex('idx_unique').on(
      table.method,
      table.endpoint,
      table.statusCode,
      table.createdAt,
      table.urlHash
    ),
  ]
)

/** Type for inserting a new response record. */
export type NewResponse = typeof responsesTable.$inferInsert

/** Type for a selected response record. */
export type ResponseRow = typeof responsesTable.$inferSelect
