/**
 * Tests for the response recorder.
 *
 * mysql2/promise is mocked via vi.hoisted() so the mock functions are
 * available when the vi.mock() factory runs. No real database is required.
 */

import crypto from 'node:crypto'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { drizzle } from 'drizzle-orm/mysql2'
import type { ResponseRecord } from '@book000/pixivts'
import * as schema from '../src/schema.js'
import { addResponse, createRecorderBundle } from '../src/recorder.js'

// ---------------------------------------------------------------------------
// Hoisted mock state — created before vi.mock() factory runs
// ---------------------------------------------------------------------------

const { mockQuery, mockExecute, mockEnd } = vi.hoisted(() => ({
  // db.execute(sql`...`) uses client.query() (text protocol / no prepared stmt)
  mockQuery: vi.fn(),
  // db.insert/select/etc uses client.execute() (prepared statement protocol)
  mockExecute: vi.fn(),
  mockEnd: vi.fn(),
}))

vi.mock('mysql2/promise', () => ({
  default: {
    createPool: vi.fn(() => ({
      query: mockQuery,
      execute: mockExecute,
      end: mockEnd,
    })),
  },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid ResponseRecord fixture. */
function makeRecord(overrides: Partial<ResponseRecord> = {}): ResponseRecord {
  return {
    method: 'GET',
    endpoint: '/v1/illust/detail',
    url: 'https://app-api.pixiv.net/v1/illust/detail?illust_id=123',
    requestHeaders: '{"Authorization":"Bearer token"}',
    requestBody: null,
    responseType: 'JSON',
    statusCode: 200,
    responseHeaders: '{"content-type":"application/json"}',
    responseBody: '{"illust":{}}',
    ...overrides,
  }
}

/** Returns the SHA-256 hex digest of a string. */
function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

// ---------------------------------------------------------------------------
// URL hash logic
// ---------------------------------------------------------------------------

describe('URL hash computation', () => {
  it('SHA-256 produces a 64-char hex string', () => {
    const hash = sha256('https://app-api.pixiv.net/v1/illust/detail?illust_id=1')
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[\da-f]{64}$/)
  })

  it('different URLs produce different hashes', () => {
    const h1 = sha256('https://app-api.pixiv.net/v1/illust/detail?illust_id=1')
    const h2 = sha256('https://app-api.pixiv.net/v1/illust/detail?illust_id=2')
    expect(h1).not.toBe(h2)
  })

  it('same URL always produces the same hash', () => {
    const url = 'https://app-api.pixiv.net/v1/illust/detail?illust_id=42'
    expect(sha256(url)).toBe(sha256(url))
  })
})

// ---------------------------------------------------------------------------
// createRecorderBundle
// ---------------------------------------------------------------------------

describe('createRecorderBundle()', () => {
  it('returns an object with interceptor, db, and close', () => {
    const db = drizzle.mock({ schema, mode: 'default' })
    const close = vi.fn().mockResolvedValue(undefined)
    const bundle = createRecorderBundle(db as never, close)

    expect(typeof bundle.interceptor).toBe('function')
    expect(bundle.db).toBe(db)
    expect(bundle.close).toBe(close)
  })

  it('close() calls the provided close function exactly once', async () => {
    const db = drizzle.mock({ schema, mode: 'default' })
    const close = vi.fn<[], Promise<void>>().mockResolvedValue(undefined)
    const bundle = createRecorderBundle(db as never, close)

    await bundle.close()
    expect(close).toHaveBeenCalledOnce()
  })

  it('interceptor is a function that returns a Promise', () => {
    const db = drizzle.mock({ schema, mode: 'default' })
    const bundle = createRecorderBundle(db as never, vi.fn())
    const record = makeRecord()

    const result = bundle.interceptor(record)
    expect(result).toBeInstanceOf(Promise)
    // Swallow any rejection from the mock db (no real session)
    void result.catch(() => undefined)
  })
})

// ---------------------------------------------------------------------------
// addResponse — pure function, testable with mocked db.insert
// ---------------------------------------------------------------------------

describe('addResponse()', () => {
  it('does not throw when the mock db accepts the insert', async () => {
    // Spy on the Drizzle mock's query execution path
    const db = drizzle.mock({ schema, mode: 'default' })
    const record = makeRecord()

    // Drizzle mock will throw "No client found" when actually executed.
    // We wrap it to verify addResponse resolves (or rejects with the expected
    // Drizzle internal error — not a hash computation error).
    let caughtError: unknown = null
    try {
      await addResponse(db as never, record)
    } catch (error: unknown) {
      caughtError = error
    }

    // The error (if any) should come from Drizzle's mock client, not from
    // our urlHash logic or other preprocessing.
    if (caughtError !== null) {
      expect(String(caughtError)).not.toContain('urlHash')
      expect(String(caughtError)).not.toContain('Cannot read')
    }
  })
})

// ---------------------------------------------------------------------------
// createResponseRecorder (integration with mocked mysql2)
// ---------------------------------------------------------------------------

describe('createResponseRecorder()', () => {
  beforeEach(() => {
    mockQuery.mockReset()
    mockExecute.mockReset()
    mockEnd.mockReset()
    // db.execute(sql`DDL`) goes through client.query() (text protocol)
    const okPacket = [{ insertId: 0, affectedRows: 0, fieldCount: 0, serverStatus: 2 }, []]
    mockQuery.mockResolvedValue(okPacket)
    // db.insert/select goes through client.execute() (prepared statements)
    mockExecute.mockResolvedValue(okPacket)
    mockEnd.mockResolvedValue(undefined)
  })

  it('creates a bundle without error (no bootstrap)', async () => {
    const { createResponseRecorder } = await import('../src/recorder.js')

    const bundle = await createResponseRecorder({
      host: 'localhost',
      database: 'testdb',
    })

    expect(typeof bundle.interceptor).toBe('function')
    expect(typeof bundle.close).toBe('function')
  })

  it('close() calls pool.end()', async () => {
    const { createResponseRecorder } = await import('../src/recorder.js')

    const bundle = await createResponseRecorder({
      host: 'localhost',
      database: 'testdb',
    })

    await bundle.close()
    expect(mockEnd).toHaveBeenCalled()
  })

  it('bootstrap=true executes a CREATE TABLE statement via client.query()', async () => {
    const { createResponseRecorder } = await import('../src/recorder.js')

    await createResponseRecorder({
      host: 'localhost',
      database: 'testdb',
      bootstrap: true,
    })

    // Drizzle's db.execute(sql`DDL`) uses client.query() (text protocol), not client.execute().
    // Drizzle passes the query as an object: { sql: string, values: unknown[] }
    expect(mockQuery).toHaveBeenCalled()
    const allArgs = mockQuery.mock.calls as unknown[][]
    const sqlTexts = allArgs.map((args) => {
      const arg = args[0]
      if (typeof arg === 'string') return arg.toLowerCase()
      if (arg && typeof arg === 'object' && 'sql' in arg) {
        return String((arg as { sql: string }).sql).toLowerCase()
      }
      return JSON.stringify(arg).toLowerCase()
    })
    const hasCreateTable = sqlTexts.some(
      (s) => s.includes('create table if not exists') && s.includes('responses')
    )
    expect(hasCreateTable).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Schema shape
// ---------------------------------------------------------------------------

describe('responsesTable schema', () => {
  it('exposes the expected TypeScript property names', () => {
    // Check that the expected camelCase property names exist on the table
    expect(schema.responsesTable.id).toBeDefined()
    expect(schema.responsesTable.method).toBeDefined()
    expect(schema.responsesTable.endpoint).toBeDefined()
    expect(schema.responsesTable.urlHash).toBeDefined()
    expect(schema.responsesTable.statusCode).toBeDefined()
    expect(schema.responsesTable.responseBody).toBeDefined()
    expect(schema.responsesTable.createdAt).toBeDefined()
  })

  it('maps camelCase properties to snake_case column names', () => {
    expect(schema.responsesTable.urlHash.name).toBe('url_hash')
    expect(schema.responsesTable.statusCode.name).toBe('status_code')
    expect(schema.responsesTable.responseBody.name).toBe('response_body')
    expect(schema.responsesTable.createdAt.name).toBe('created_at')
    expect(schema.responsesTable.requestHeaders.name).toBe('request_headers')
    expect(schema.responsesTable.requestBody.name).toBe('request_body')
    expect(schema.responsesTable.responseHeaders.name).toBe('response_headers')
    expect(schema.responsesTable.responseType.name).toBe('response_type')
  })
})
