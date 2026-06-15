import { describe, expect, it } from 'vitest'
import { err, ok, Result, ResultAsync } from '../src/result.js'
import {
  apiError,
  authFailedError,
  networkError,
  PixivError,
  rateLimitError,
} from '../src/errors.js'

// ---------------------------------------------------------------------------
// Result<T, E>
// ---------------------------------------------------------------------------

describe('ok()', () => {
  it('creates an OkResult', () => {
    const r = ok(42)
    expect(r.isOk).toBe(true)
    expect(r.isErr).toBe(false)
    expect(r.value).toBe(42)
  })

  it('map transforms the value', () => {
    const r = ok(2).map((x) => x * 3)
    expect(r.isOk).toBe(true)
    expect(r.value).toBe(6)
  })

  it('mapErr is a no-op', () => {
    const r = ok<number>(1).mapErr(() => 'ignored')
    expect(r.isOk).toBe(true)
    expect(r.value).toBe(1)
  })

  it('andThen chains to Ok', () => {
    const r = ok(5).andThen((x) => ok(x + 1))
    expect(r.isOk).toBe(true)
    expect(r.value).toBe(6)
  })

  it('andThen chains to Err', () => {
    const r = ok(5).andThen<number, string>(() => err('oops'))
    expect(r.isErr).toBe(true)
    expect(r.error).toBe('oops')
  })

  it('match calls onOk', () => {
    const out = ok(10).match(
      (v) => `ok:${v}`,
      () => 'err'
    )
    expect(out).toBe('ok:10')
  })

  it('unwrapOr returns the value', () => {
    expect(ok(99).unwrapOr(0)).toBe(99)
  })
})

describe('err()', () => {
  it('creates an ErrResult', () => {
    const r = err('bad')
    expect(r.isOk).toBe(false)
    expect(r.isErr).toBe(true)
    expect(r.error).toBe('bad')
  })

  it('map is a no-op', () => {
    const r = err<string>('e').map(() => 42)
    expect(r.isErr).toBe(true)
    expect(r.error).toBe('e')
  })

  it('mapErr transforms the error', () => {
    const r = err('e').mapErr((e) => e.toUpperCase())
    expect(r.isErr).toBe(true)
    expect(r.error).toBe('E')
  })

  it('andThen is a no-op', () => {
    const r = err<string>('e').andThen<number, string>(() => ok(1))
    expect(r.isErr).toBe(true)
    expect(r.error).toBe('e')
  })

  it('match calls onErr', () => {
    const out = err('boom').match(
      () => 'ok',
      (e) => `err:${e}`
    )
    expect(out).toBe('err:boom')
  })

  it('unwrapOr returns the fallback', () => {
    expect(err('e').unwrapOr(42)).toBe(42)
  })
})

// ---------------------------------------------------------------------------
// ResultAsync<T, E>
// ---------------------------------------------------------------------------

describe('ResultAsync.fromPromise()', () => {
  it('wraps a resolved promise into Ok', async () => {
    const r = await ResultAsync.fromPromise(Promise.resolve(7), String)
    expect(r.isOk).toBe(true)
    expect(r.value).toBe(7)
  })

  it('wraps a rejected promise into Err', async () => {
    const r = await ResultAsync.fromPromise(
      Promise.reject(new Error('oops')),
      (e: unknown) => (e instanceof Error ? e.message : String(e))
    )
    expect(r.isErr).toBe(true)
    expect(r.error).toBe('oops')
  })
})

describe('ResultAsync.fromResult()', () => {
  it('wraps an Ok result', async () => {
    const r = await ResultAsync.fromResult(ok(3))
    expect(r.isOk).toBe(true)
    expect(r.value).toBe(3)
  })

  it('wraps an Err result', async () => {
    const r = await ResultAsync.fromResult(err('e'))
    expect(r.isErr).toBe(true)
    expect(r.error).toBe('e')
  })
})

describe('ResultAsync.map()', () => {
  it('transforms the success value', async () => {
    const r = await ResultAsync.fromResult(ok(4)).map((x) => x * 2)
    expect(r.isOk).toBe(true)
    expect(r.value).toBe(8)
  })

  it('does not call fn on Err', async () => {
    let called = false
    const r = await ResultAsync.fromResult(err('e')).map(() => {
      called = true
      return 0
    })
    expect(called).toBe(false)
    expect(r.isErr).toBe(true)
  })
})

describe('ResultAsync.mapErr()', () => {
  it('transforms the error', async () => {
    const r = await ResultAsync.fromResult(err('x')).mapErr((e) =>
      e.toUpperCase()
    )
    expect(r.isErr).toBe(true)
    expect(r.error).toBe('X')
  })

  it('does not call fn on Ok', async () => {
    let called = false
    const r = await ResultAsync.fromResult(ok(1)).mapErr(() => {
      called = true
      return 'e'
    })
    expect(called).toBe(false)
    expect(r.isOk).toBe(true)
  })
})

describe('ResultAsync.andThen()', () => {
  it('chains through Ok', async () => {
    const r = await ResultAsync.fromResult(ok(1)).andThen((x) =>
      ResultAsync.fromResult(ok(x + 10))
    )
    expect(r.isOk).toBe(true)
    expect(r.value).toBe(11)
  })

  it('short-circuits on Err', async () => {
    let called = false
    const r = await ResultAsync.fromResult(err<string>('e')).andThen(() => {
      called = true
      return ResultAsync.fromResult(ok(1))
    })
    expect(called).toBe(false)
    expect(r.isErr).toBe(true)
    expect(r.error).toBe('e')
  })

  it('propagates Err from the chained fn', async () => {
    const r = await ResultAsync.fromResult(ok(1)).andThen<number, string>(() =>
      ResultAsync.fromResult(err('chain-err'))
    )
    expect(r.isErr).toBe(true)
    expect(r.error).toBe('chain-err')
  })
})

describe('ResultAsync.match()', () => {
  it('calls onOk for a successful result', async () => {
    const out = await ResultAsync.fromResult(ok(5)).match(
      (v) => `ok:${v}`,
      () => 'err'
    )
    expect(out).toBe('ok:5')
  })

  it('calls onErr for a failed result', async () => {
    const out = await ResultAsync.fromResult(err('boom')).match(
      () => 'ok',
      (e) => `err:${e}`
    )
    expect(out).toBe('err:boom')
  })
})

describe('ResultAsync.unwrapOr()', () => {
  it('returns the value on Ok', async () => {
    expect(await ResultAsync.fromResult(ok(42)).unwrapOr(0)).toBe(42)
  })

  it('returns the fallback on Err', async () => {
    expect(await ResultAsync.fromResult(err('e')).unwrapOr(99)).toBe(99)
  })
})

describe('ResultAsync await', () => {
  it('is directly awaitable and returns a Result', async () => {
    const r: Result<number, string> = await ResultAsync.fromResult(ok(7))
    expect(r.isOk).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// PixivError constructors
// ---------------------------------------------------------------------------

describe('PixivError constructors', () => {
  it('rateLimitError', () => {
    const e: PixivError = rateLimitError(5000)
    expect(e.type).toBe('rate_limit')
    if (e.type === 'rate_limit') expect(e.retryAfter).toBe(5000)
  })

  it('authFailedError', () => {
    const e = authFailedError(401)
    expect(e.type).toBe('auth_failed')
    if (e.type === 'auth_failed') expect(e.status).toBe(401)
  })

  it('networkError', () => {
    const cause = new Error('ECONNREFUSED')
    const e = networkError(cause)
    expect(e.type).toBe('network')
    if (e.type === 'network') expect(e.cause).toBe(cause)
  })

  it('apiError', () => {
    const e = apiError(404, { error: 'not found' })
    expect(e.type).toBe('api_error')
    if (e.type === 'api_error') {
      expect(e.status).toBe(404)
      expect(e.body).toEqual({ error: 'not found' })
    }
  })
})
