import { describe, expect, it } from 'vitest'
import { md5, buildClientHash } from '../src/auth'

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
