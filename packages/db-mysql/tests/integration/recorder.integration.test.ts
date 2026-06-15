/**
 * Integration tests for the db-mysql response recorder against a real MySQL
 * instance.
 *
 * Prerequisites:
 *   - A MySQL instance is running
 *   - The following environment variables are set:
 *       RESPONSE_DB_HOSTNAME  (default: localhost)
 *       RESPONSE_DB_PORT      (default: 3306)
 *       RESPONSE_DB_USERNAME  (e.g. pixiv-ts)
 *       RESPONSE_DB_PASSWORD  (e.g. pixiv-ts-test)
 *       RESPONSE_DB_DATABASE  (e.g. pixiv-ts)
 *
 * The tests skip automatically when RESPONSE_DB_USERNAME is not set.
 *
 * In CI, the MySQL service is started as a GitHub Actions service container
 * using the same environment variables.
 *
 * Run manually:
 *   RESPONSE_DB_USERNAME=pixiv-ts RESPONSE_DB_PASSWORD=pixiv-ts-test \
 *   RESPONSE_DB_DATABASE=pixiv-ts \
 *   pnpm --filter @book000/pixivts-db-mysql run test:integration
 */

import { eq, or } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  addResponse,
  createResponseRecorder,
  getEndpoints,
  getResponseCount,
  getResponses,
  type RecorderBundle,
} from '../../src/recorder'
import { bootstrapSchema } from '../../src/migrations'
import { responsesTable } from '../../src/schema'
import type { ResponseRecord } from '@book000/pixivts'

// ---------------------------------------------------------------------------
// Skip guard
// ---------------------------------------------------------------------------

const SKIP = !process.env['RESPONSE_DB_USERNAME']

// ---------------------------------------------------------------------------
// Test endpoints (isolated from production data via unusual paths)
// ---------------------------------------------------------------------------

const E2E_ENDPOINT_A = '/v1/integration-test/illust'
const E2E_ENDPOINT_B = '/v1/integration-test/novel'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a minimal ResponseRecord for testing. */
function makeRecord(overrides: Partial<ResponseRecord> = {}): ResponseRecord {
  return {
    method: 'GET',
    endpoint: E2E_ENDPOINT_A,
    url: `https://app-api.pixiv.net${E2E_ENDPOINT_A}?illust_id=107565629`,
    requestHeaders: JSON.stringify({ 'User-Agent': 'PixivIOSApp/7.13.3' }),
    requestBody: null,
    responseType: 'JSON',
    statusCode: 200,
    responseHeaders: JSON.stringify({ 'Content-Type': 'application/json' }),
    responseBody: JSON.stringify({ illust: { id: 107_565_629 } }),
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe.skipIf(SKIP)('db-mysql integration', () => {
  let bundle: RecorderBundle

  beforeAll(async () => {
    // Create recorder with bootstrap=true to ensure the table exists.
    bundle = await createResponseRecorder({ bootstrap: true })

    // Clean up any leftover rows from a previous run so test counts are stable.
    await bundle.db
      .delete(responsesTable)
      .where(
        or(
          eq(responsesTable.endpoint, E2E_ENDPOINT_A),
          eq(responsesTable.endpoint, E2E_ENDPOINT_B)
        )
      )
  })

  afterAll(async () => {
    // Clean up test rows so we leave the DB in a clean state.
    await bundle.db
      .delete(responsesTable)
      .where(
        or(
          eq(responsesTable.endpoint, E2E_ENDPOINT_A),
          eq(responsesTable.endpoint, E2E_ENDPOINT_B)
        )
      )
    await bundle.close()
  })

  it('bootstrapSchema — CREATE TABLE IF NOT EXISTS succeeds', async () => {
    // bootstrapSchema is idempotent; calling it again must not throw.
    await expect(bootstrapSchema(bundle.db)).resolves.toBeUndefined()
  })

  it('addResponse — inserts a row', async () => {
    await addResponse(bundle.db, makeRecord())
    const rows = await getResponses(bundle.db, { endpoint: E2E_ENDPOINT_A })
    expect(rows.length).toBe(1)
    expect(rows[0].endpoint).toBe(E2E_ENDPOINT_A)
    expect(rows[0].statusCode).toBe(200)
    expect(rows[0].responseBody).toBe(
      JSON.stringify({ illust: { id: 107_565_629 } })
    )
  })

  it('addResponse — duplicate is silently ignored', async () => {
    // Insert the same record twice; the composite unique index should fire.
    const record = makeRecord({ endpoint: E2E_ENDPOINT_B })
    await addResponse(bundle.db, record)
    await addResponse(bundle.db, record)
    const countAfter = await getResponseCount(bundle.db, {
      endpoint: E2E_ENDPOINT_B,
    })
    // Only one row should exist despite two inserts.
    expect(countAfter).toBe(1)
  })

  it('interceptor — records responses when invoked directly', async () => {
    // Call the interceptor directly (no real API needed) and verify it writes to DB.
    const record = makeRecord({
      url: `https://app-api.pixiv.net${E2E_ENDPOINT_A}?illust_id=999`,
      responseBody: JSON.stringify({ illust: { id: 999 } }),
    })
    await bundle.interceptor(record)

    const rows = await getResponses(bundle.db, { endpoint: E2E_ENDPOINT_A })
    const found = rows.find(
      (r) => r.responseBody === JSON.stringify({ illust: { id: 999 } })
    )
    expect(found).toBeDefined()
  })

  it('getResponses — returns rows ordered newest first', async () => {
    const rows = await getResponses(bundle.db, { endpoint: E2E_ENDPOINT_A })
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
        rows[i].createdAt.getTime()
      )
    }
  })

  it('getResponses — pagination limit is respected', async () => {
    const rows = await getResponses(bundle.db, {}, { page: 1, limit: 1 })
    expect(rows.length).toBeLessThanOrEqual(1)
  })

  it('getResponseCount — returns total matching count', async () => {
    const total = await getResponseCount(bundle.db, {
      endpoint: E2E_ENDPOINT_A,
    })
    expect(total).toBeGreaterThanOrEqual(1)
  })

  it('getResponseCount — returns 0 for a non-existent endpoint', async () => {
    const total = await getResponseCount(bundle.db, {
      endpoint: '/v1/this-endpoint-does-not-exist',
    })
    expect(total).toBe(0)
  })

  it('getEndpoints — lists unique endpoints with counts', async () => {
    const endpoints = await getEndpoints(bundle.db)
    const entry = endpoints.find(
      (e) => e.endpoint === E2E_ENDPOINT_A && e.method === 'GET'
    )
    expect(entry).toBeDefined()
    expect(entry?.count).toBeGreaterThanOrEqual(1)
    expect(typeof entry?.statusCode).toBe('number')
  })

  it('getEndpoints — results are sorted by count descending', async () => {
    const endpoints = await getEndpoints(bundle.db)
    for (let i = 1; i < endpoints.length; i++) {
      expect(endpoints[i - 1].count).toBeGreaterThanOrEqual(endpoints[i].count)
    }
  })
})
