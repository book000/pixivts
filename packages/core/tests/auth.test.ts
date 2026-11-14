import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthManager, md5, buildClientHash } from '../src/auth'
import { PixivAuthError } from '../src/errors'

describe('md5()', () => {
  // Reference vectors from RFC 1321 and well-known test cases
  it('empty string', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e')
  })

  it('"a"', () => {
    expect(md5('a')).toBe('0cc175b9c0f1b6a831c399e269772661')
  })

  it('"abc"', () => {
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72')
  })

  it('"message digest"', () => {
    expect(md5('message digest')).toBe('f96b697d7cb7938d525a2f31aaf161d0')
  })

  it('longer string', () => {
    expect(md5('abcdefghijklmnopqrstuvwxyz')).toBe(
      'c3fcd3d76192e4007dfb496cca67e13b'
    )
  })

  it('string with special characters', () => {
    // Known MD5 of "Hello, World!"
    expect(md5('Hello, World!')).toBe('65a8e27d8879283831b664bd8b7f0ad4')
  })

  // Expected digests below come from Node's crypto.createHash('md5') over UTF-8 bytes
  it('2-byte UTF-8 character', () => {
    expect(md5('é')).toBe('66ddcd97cfdeabb2f6fb8a999b4bc76f')
  })

  it('3-byte UTF-8 characters', () => {
    expect(md5('日本語')).toBe('00110af8b4393ef3f72c50be5b332bec')
  })

  it('4-byte UTF-8 character (surrogate pair)', () => {
    expect(md5('😀')).toBe('2a02eac39d716a70ecf37579185927b6')
  })

  it('4-byte UTF-8 character between ASCII characters', () => {
    expect(md5('a😀b')).toBe('186ca4f1a2d2ac0d5381177c6719713b')
  })

  it('highest code point U+10FFFF', () => {
    expect(md5('\u{10FFFF}')).toBe('317291ce605601732d9d1fe361ca887e')
  })
})

describe('buildClientHash()', () => {
  it('returns a 32-character lowercase hex string', () => {
    const hash = buildClientHash('2024-01-01T00:00:00+00:00')
    expect(hash).toMatch(/^[\da-f]{32}$/)
  })

  it('is deterministic for the same input', () => {
    const ts = '2025-06-15T12:00:00+00:00'
    expect(buildClientHash(ts)).toBe(buildClientHash(ts))
  })

  it('produces different hashes for different timestamps', () => {
    expect(buildClientHash('2025-01-01T00:00:00+00:00')).not.toBe(
      buildClientHash('2025-01-02T00:00:00+00:00')
    )
  })
})

describe('AuthManager.refresh() failure', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const refreshWith = (status: number, body: string) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(body, { status })
    )
    return AuthManager.login('dummy-refresh-token')
  }

  it('throws PixivAuthError with the error code for a JSON body', async () => {
    const err = await refreshWith(
      400,
      JSON.stringify({ error: 'invalid_grant', error_description: 'x' })
    ).catch((error: unknown) => error)
    expect(err).toBeInstanceOf(PixivAuthError)
    const e = err as PixivAuthError
    expect(e.status).toBe(400)
    expect(e.code).toBe('invalid_grant')
    expect(e.message).toBe(
      'Failed to refresh pixiv token: HTTP 400 (invalid_grant)'
    )
  })

  it('reads errors.system.message and keeps the legacy prefix for non-JSON', async () => {
    const e1 = (await refreshWith(
      400,
      JSON.stringify({
        has_error: true,
        errors: { system: { message: 'bad' } },
      })
    ).catch((error: unknown) => error)) as PixivAuthError
    expect(e1.code).toBe('bad')
    const e2 = (await refreshWith(502, '<html>oops</html>').catch(
      (error: unknown) => error
    )) as PixivAuthError
    expect(e2.message).toBe('Failed to refresh pixiv token: HTTP 502')
    expect(e2.code).toBeUndefined()
  })

  it('truncates the body and redacts token-like strings', async () => {
    const secret = 'a'.repeat(40)
    const e = (await refreshWith(
      400,
      `refresh_token=${secret} ${'x '.repeat(300)}`
    ).catch((error: unknown) => error)) as PixivAuthError
    expect(e.body).not.toContain(secret)
    expect(e.body).toContain('[REDACTED]')
    expect(e.body.length).toBeLessThanOrEqual(203)
    expect(e.message).not.toContain(secret)
  })

  it('replaces control characters in code and body', async () => {
    const e = (await refreshWith(
      400,
      JSON.stringify({ error: 'invalid_grant\n[ERROR] forged\u001B[31m\u0000' })
    ).catch((error: unknown) => error)) as PixivAuthError
    expect(e.code).toBe('invalid_grant [ERROR] forged [31m ')
    expect(e.message).toBe(
      'Failed to refresh pixiv token: HTTP 400 (invalid_grant [ERROR] forged [31m )'
    )
    const raw = (await refreshWith(502, 'bad\nline\u001B[0m').catch(
      (error: unknown) => error
    )) as PixivAuthError
    expect(raw.body).toBe('bad line [0m')
  })
})
