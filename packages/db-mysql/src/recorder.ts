/**
 * Response recorder for @book000/pixivts-db-mysql.
 *
 * `createResponseRecorder()` returns a `{ interceptor, db, close }` bundle:
 *   - `interceptor` — pass to `PixivClient.of(token, { onResponse: interceptor })`
 *   - `db` — the raw Drizzle instance for custom queries
 *   - `close()` — shuts down the connection pool
 *
 * The recorder uses Drizzle ORM's `onDuplicateKeyUpdate` to silently ignore
 * duplicate entries (same method + endpoint + statusCode + urlHash).
 */

import crypto from 'node:crypto'
import { and, count, desc, eq, gte, sql } from 'drizzle-orm'
import type { ResponseInterceptor, ResponseRecord } from '@book000/pixivts'
import { createDbConnection, type ConnectionOptions, type DbInstance } from './connection'
import { responsesTable, type ResponseRow } from './schema'
import { bootstrapSchema } from './migrations'

// ---------------------------------------------------------------------------
// Result bundle
// ---------------------------------------------------------------------------

/** The object returned by `createResponseRecorder()`. */
export interface RecorderBundle {
  /**
   * Response interceptor — pass directly to `PixivClient.of()` as
   * the `onResponse` option.
   */
  interceptor: ResponseInterceptor

  /** Drizzle ORM database instance for custom queries. */
  db: DbInstance

  /** Closes the underlying connection pool. */
  close(): Promise<void>
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options for `createResponseRecorder()`. */
export interface RecorderOptions extends ConnectionOptions {
  /**
   * If `true`, runs `CREATE TABLE IF NOT EXISTS` before returning.
   * Useful for first-run bootstrapping without a separate migration step.
   *
   * @default false
   */
  bootstrap?: boolean
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a response recorder that persists every pixiv API response to MySQL.
 *
 * @param opts - Connection and bootstrapping options
 * @returns `{ interceptor, db, close }`
 *
 * @example
 * ```ts
 * const { interceptor, close } = await createResponseRecorder({
 *   host: 'localhost',
 *   database: 'pixivts',
 *   bootstrap: true,
 * })
 * const client = await PixivClient.of(token, { onResponse: interceptor })
 * // ...
 * await close()
 * ```
 */
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ninetyDaysAgo(): Date {
  return new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
}

// ---------------------------------------------------------------------------
// Core DB helpers (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Inserts a response record into the database.
 *
 * If the unique composite index fires (duplicate method + endpoint + statusCode
 * + urlHash), the insert is silently ignored via `ON DUPLICATE KEY UPDATE id = id`.
 *
 * @param db - Drizzle ORM database instance
 * @param record - Response record from the HTTP client interceptor
 */
export async function addResponse(
  db: DbInstance,
  record: ResponseRecord
): Promise<void> {
  // Hash the URL if present; fall back to "method:endpoint" so the column is never empty.
  const urlToHash = record.url ?? `${record.method}:${record.endpoint}`
  const urlHash = crypto
    .createHash('sha256')
    .update(urlToHash)
    .digest('hex')

  await db
    .insert(responsesTable)
    .values({
      method: record.method,
      endpoint: record.endpoint,
      url: record.url,
      urlHash,
      requestHeaders: record.requestHeaders,
      requestBody: record.requestBody,
      responseType: record.responseType,
      statusCode: record.statusCode,
      responseHeaders: record.responseHeaders,
      responseBody: record.responseBody,
      createdAt: new Date(),
    })
    .onDuplicateKeyUpdate({ set: { id: sql`id` } })
}

/**
 * Creates a `RecorderBundle` from an existing Drizzle instance.
 *
 * Useful for testing — pass a mock `db` and a no-op `close`.
 *
 * @param db - Drizzle ORM database instance
 * @param close - Function that closes the underlying connection
 */
export function createRecorderBundle(
  db: DbInstance,
  close: () => Promise<void>
): RecorderBundle {
  const interceptor: ResponseInterceptor = (record) =>
    addResponse(db, record)

  return { interceptor, db, close }
}

/**
 * Creates a response recorder that persists every pixiv API response to MySQL.
 *
 * @param opts - Connection and bootstrapping options
 * @returns `{ interceptor, db, close }`
 *
 * @example
 * ```ts
 * const { interceptor, close } = await createResponseRecorder({
 *   host: 'localhost',
 *   database: 'pixivts',
 *   bootstrap: true,
 * })
 * const client = await PixivClient.of(token, { onResponse: interceptor })
 * // ...
 * await close()
 * ```
 */
export async function createResponseRecorder(
  opts: RecorderOptions
): Promise<RecorderBundle> {
  const { pool, db } = createDbConnection(opts)

  if (opts.bootstrap) {
    await bootstrapSchema(db)
  }

  return createRecorderBundle(db, () => pool.end())
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/** Filter criteria for response queries. */
export interface ResponseFilter {
  method?: string
  endpoint?: string
  statusCode?: number
}

/** Pagination options for `getResponses`. */
export interface RangeOptions {
  /** 1-based page number (default: 1). */
  page?: number
  /** Items per page (default: 100). */
  limit?: number
}

/**
 * Retrieves response records from the last 90 days.
 *
 * @param db - Drizzle ORM database instance
 * @param filter - Optional filter criteria
 * @param range - Optional pagination options
 * @returns Array of response rows, newest first
 */
export async function getResponses(
  db: DbInstance,
  filter?: ResponseFilter,
  range?: RangeOptions
): Promise<ResponseRow[]> {
  const since = ninetyDaysAgo()
  const limit = range?.limit ?? 100
  const offset = ((range?.page ?? 1) - 1) * limit

  return db
    .select()
    .from(responsesTable)
    .where(
      and(
        gte(responsesTable.createdAt, since),
        filter?.method
          ? eq(responsesTable.method, filter.method)
          : undefined,
        filter?.endpoint
          ? eq(responsesTable.endpoint, filter.endpoint)
          : undefined,
        filter?.statusCode
          ? eq(responsesTable.statusCode, filter.statusCode)
          : undefined
      )
    )
    .orderBy(desc(responsesTable.createdAt))
    .limit(limit)
    .offset(offset)
}

/**
 * Returns the total count of response records from the last 90 days.
 *
 * @param db - Drizzle ORM database instance
 * @param filter - Optional filter criteria
 * @returns Total row count matching the filter
 */
export async function getResponseCount(
  db: DbInstance,
  filter?: ResponseFilter
): Promise<number> {
  const since = ninetyDaysAgo()
  const rows = await db
    .select({ value: count() })
    .from(responsesTable)
    .where(
      and(
        gte(responsesTable.createdAt, since),
        filter?.method
          ? eq(responsesTable.method, filter.method)
          : undefined,
        filter?.endpoint
          ? eq(responsesTable.endpoint, filter.endpoint)
          : undefined,
        filter?.statusCode
          ? eq(responsesTable.statusCode, filter.statusCode)
          : undefined
      )
    )
  return rows[0]?.value ?? 0
}

/** An endpoint with its response count. */
export interface EndpointWithCount {
  method: string
  endpoint: string
  statusCode: number
  count: number
}

/**
 * Returns all unique (method, endpoint, statusCode) combinations seen in the
 * last 90 days, along with the count of matching records.
 *
 * @param db - Drizzle ORM database instance
 * @returns Endpoints sorted by count descending
 */
export async function getEndpoints(db: DbInstance): Promise<EndpointWithCount[]> {
  const since = ninetyDaysAgo()
  const rows = await db
    .select({
      method: responsesTable.method,
      endpoint: responsesTable.endpoint,
      statusCode: responsesTable.statusCode,
      count: count(),
    })
    .from(responsesTable)
    .where(gte(responsesTable.createdAt, since))
    .groupBy(
      responsesTable.method,
      responsesTable.endpoint,
      responsesTable.statusCode
    )
    .orderBy(desc(count()))

  return rows.map((r) => ({ ...r, count: r.count }))
}
