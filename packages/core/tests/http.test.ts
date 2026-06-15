import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers.js'
import { AuthManager } from '../src/auth.js'
import { HttpClient, parseRetryAfter } from '../src/http.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAuth(accessToken = 'test-token'): AuthManager {
  return new AuthManager({ userId: '1', accessToken, refreshToken: 'rt' })
}

function makeClient(
  auth: AuthManager = makeAuth(),
  opts?: ConstructorParameters<typeof HttpClient>[1]
): HttpClient {
  return new HttpClient(auth, { retry: { maxRetries: 2, waitMs: 10 }, ...opts })
}

// ---------------------------------------------------------------------------
// parseRetryAfter()
// ---------------------------------------------------------------------------

describe('parseRetryAfter()', () => {
  it('returns default when header is null', () => {
    expect(parseRetryAfter(null, 5000)).toBe(5000)
  })

  it('parses delay-seconds format', () => {
    expect(parseRetryAfter('3', 5000)).toBe(3000)
  })

  it('returns default for unparseable value', () => {
    expect(parseRetryAfter('garbage', 5000)).toBe(5000)
  })

  it('parses HTTP-date format (returns non-negative)', () => {
    // A past date → 0 (clamped)
    const past = new Date(Date.now() - 10_000).toUTCString()
    expect(parseRetryAfter(past, 5000)).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// GET success
// ---------------------------------------------------------------------------

describe('HttpClient.get()', () => {
  it('returns Ok on 200', async () => {
    server.use(
      http.get('https://app-api.pixiv.net/v1/test', () =>
        HttpResponse.json({ hello: 'world' })
      )
    )
    const client = makeClient()
    const r = await client.get<{ hello: string }>('/v1/test')
    expect(r.isOk).toBe(true)
    if (r.isOk) expect(r.value).toEqual({ hello: 'world' })
  })

  it('passes query parameters', async () => {
    let captured = ''
    server.use(
      http.get('https://app-api.pixiv.net/v1/search/illust', ({ request }) => {
        captured = new URL(request.url).search
        return HttpResponse.json({ illusts: [] })
      })
    )
    const params = new URLSearchParams({ word: 'cat', filter: 'for_ios' })
    await makeClient().get('/v1/search/illust', params)
    expect(captured).toContain('word=cat')
    expect(captured).toContain('filter=for_ios')
  })

  it('returns Err(api_error) on 404', async () => {
    server.use(
      http.get('https://app-api.pixiv.net/v1/missing', () =>
        HttpResponse.json({ error: 'not found' }, { status: 404 })
      )
    )
    const r = await makeClient().get('/v1/missing')
    expect(r.isErr).toBe(true)
    if (r.isErr) {
      expect(r.error.type).toBe('api_error')
      if (r.error.type === 'api_error') expect(r.error.status).toBe(404)
    }
  })
})

// ---------------------------------------------------------------------------
// POST success
// ---------------------------------------------------------------------------

describe('HttpClient.post()', () => {
  it('returns Ok on 200', async () => {
    server.use(
      http.post('https://app-api.pixiv.net/v2/illust/bookmark/add', () =>
        HttpResponse.json({ result: true })
      )
    )
    const r = await makeClient().post<{ result: boolean }>(
      '/v2/illust/bookmark/add',
      'illust_id=12345&restrict=public'
    )
    expect(r.isOk).toBe(true)
    if (r.isOk) expect(r.value).toEqual({ result: true })
  })
})

// ---------------------------------------------------------------------------
// 429 retry
// ---------------------------------------------------------------------------

describe('429 retry', () => {
  it('retries and succeeds after rate-limit', async () => {
    let calls = 0
    server.use(
      http.get('https://app-api.pixiv.net/v1/retry-test', () => {
        calls++
        if (calls < 2) return new HttpResponse(null, { status: 429 })
        return HttpResponse.json({ ok: true })
      })
    )
    const r = await makeClient().get('/v1/retry-test')
    expect(r.isOk).toBe(true)
    expect(calls).toBe(2)
  })

  it('returns Err(rate_limit) after exhausting retries', async () => {
    server.use(
      http.get('https://app-api.pixiv.net/v1/always-429', () =>
        new HttpResponse(null, {
          status: 429,
          headers: { 'Retry-After': '0' },
        })
      )
    )
    const client = makeClient(makeAuth(), { retry: { maxRetries: 1, waitMs: 0 } })
    const r = await client.get('/v1/always-429')
    expect(r.isErr).toBe(true)
    if (r.isErr) expect(r.error.type).toBe('rate_limit')
  })

  it('respects Retry-After delay-seconds header', async () => {
    let calls = 0
    const start = Date.now()
    server.use(
      http.get('https://app-api.pixiv.net/v1/slow-retry', () => {
        calls++
        if (calls < 2) {
          return new HttpResponse(null, {
            status: 429,
            headers: { 'Retry-After': '0' },
          })
        }
        return HttpResponse.json({ done: true })
      })
    )
    await makeClient().get('/v1/slow-retry')
    expect(Date.now() - start).toBeLessThan(5000)
    expect(calls).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// 401 refresh and retry
// ---------------------------------------------------------------------------

describe('401 auth refresh', () => {
  it('refreshes the token and retries on 401', async () => {
    let calls = 0
    let sawNewToken = false

    // Token refresh endpoint
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json({
          user: { id: '42' },
          response: {
            access_token: 'refreshed-token',
            refresh_token: 'new-rt',
          },
        })
      ),
      http.get('https://app-api.pixiv.net/v1/auth-test', ({ request }) => {
        calls++
        if (request.headers.get('authorization') === 'Bearer refreshed-token') {
          sawNewToken = true
          return HttpResponse.json({ ok: true })
        }
        return new HttpResponse(null, { status: 401 })
      })
    )

    const auth = makeAuth('old-token')
    const r = await makeClient(auth).get('/v1/auth-test')
    expect(r.isOk).toBe(true)
    expect(sawNewToken).toBe(true)
    expect(calls).toBe(2)
  })

  it('returns Err(auth_failed) when refresh itself fails', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        new HttpResponse(null, { status: 400 })
      ),
      http.get('https://app-api.pixiv.net/v1/auth-fail', () =>
        new HttpResponse(null, { status: 401 })
      )
    )
    const r = await makeClient().get('/v1/auth-fail')
    expect(r.isErr).toBe(true)
    if (r.isErr) expect(r.error.type).toBe('auth_failed')
  })
})

// ---------------------------------------------------------------------------
// Response interceptor
// ---------------------------------------------------------------------------

describe('response interceptor', () => {
  it('calls the interceptor with the response record', async () => {
    server.use(
      http.get('https://app-api.pixiv.net/v1/intercepted', () =>
        HttpResponse.json({ data: 42 })
      )
    )

    const records: unknown[] = []
    const client = makeClient(makeAuth(), {
      onResponse: (rec) => {
        records.push(rec)
      },
    })

    await client.get('/v1/intercepted')
    expect(records).toHaveLength(1)
    const rec = records[0] as {
      endpoint: string
      responseType: string
      statusCode: number
    }
    expect(rec.endpoint).toBe('/v1/intercepted')
    expect(rec.responseType).toBe('JSON')
    expect(rec.statusCode).toBe(200)
  })
})
