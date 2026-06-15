/**
 * Authentication manager for the pixiv API.
 *
 * Handles the OAuth 2.0 token refresh flow and generates the
 * x-client-hash header required by the pixiv iOS app API.
 *
 * The MD5 implementation is pure TypeScript to ensure Edge/browser compatibility —
 * Node's `crypto.createHash('md5')` is unavailable in Edge runtimes, and
 * `crypto.subtle` does not support MD5 (non-cryptographic hash).
 */

/** Auth credentials returned by the pixiv token endpoint. */
export interface AuthCredentials {
  /** Numeric user ID returned as a string by the token endpoint. */
  userId: string
  /** Short-lived bearer token for API requests. */
  accessToken: string
  /** Long-lived token used to obtain new access tokens. */
  refreshToken: string
}

// ---------------------------------------------------------------------------
// Pure-TS MD5 for x-client-hash
// ---------------------------------------------------------------------------

// Per-round constants derived from sin (Table T in RFC 1321)
const T: number[] = Array.from({ length: 64 }, (_, i) =>
  Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32)
)

// Shift amounts per round
const S = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
  9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
  16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
  15, 21,
]

function md5Bytes(bytes: number[]): string {
  const len = bytes.length
  // Append bit 1 (0x80 byte)
  bytes.push(0x80)
  // Pad to 56 mod 64 bytes
  while (bytes.length % 64 !== 56) bytes.push(0)
  // Append original length in bits as little-endian 64-bit
  const bitLen = len * 8
  for (let i = 0; i < 8; i++) {
    bytes.push(i < 4 ? (bitLen >>> (i * 8)) & 0xff : 0)
  }

  // Initial hash state
  let a = 0x67_45_23_01
  let b = 0xef_cd_ab_89
  let c = 0x98_ba_dc_fe
  let d = 0x10_32_54_76

  // Process each 64-byte chunk
  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    // Read chunk as 16 little-endian 32-bit words
    const M: number[] = []
    for (let w = 0; w < 16; w++) {
      const off = chunk + w * 4
      M.push(
        bytes[off] |
          (bytes[off + 1] << 8) |
          (bytes[off + 2] << 16) |
          (bytes[off + 3] << 24)
      )
    }

    let aa = a
    let bb = b
    let cc = c
    let dd = d

    for (let i = 0; i < 64; i++) {
      let f: number
      let g: number
      if (i < 16) {
        f = (bb & cc) | (~bb & dd)
        g = i
      } else if (i < 32) {
        f = (dd & bb) | (~dd & cc)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        f = bb ^ cc ^ dd
        g = (3 * i + 5) % 16
      } else {
        f = cc ^ (bb | ~dd)
        g = (7 * i) % 16
      }

      const tmp = dd
      dd = cc
      cc = bb
      const sum = Math.trunc(aa + f + M[g] + T[i])
      const rotated = (sum << S[i]) | (sum >>> (32 - S[i]))
      bb = Math.trunc(bb + rotated)
      aa = tmp
    }

    a = Math.trunc(a + aa)
    b = Math.trunc(b + bb)
    c = Math.trunc(c + cc)
    d = Math.trunc(d + dd)
  }

  // Convert the state to a hex string (little-endian)
  return [a, b, c, d]
    .map((n) =>
      [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
    )
    .join('')
}

/**
 * Produces a hex-encoded MD5 digest of `input`.
 *
 * This is a minimal, spec-compliant implementation (RFC 1321) that avoids
 * any runtime platform dependency.
 *
 * @param input - UTF-8 string to hash
 * @returns Lowercase hex-encoded MD5 digest
 */
export function md5(input: string): string {
  // Encode the input string as a sequence of bytes (UTF-8)
  const bytes: number[] = []
  for (let i = 0; i < input.length; i++) {
    const code = input.codePointAt(i) ?? 0
    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x8_00) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    } else {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      )
    }
  }

  return md5Bytes(bytes)
}


// ---------------------------------------------------------------------------
// AuthManager
// ---------------------------------------------------------------------------

const CLIENT_ID = 'MOBrBDS8blbauoSck0ZfDbtuzpyT'
const CLIENT_SECRET = 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj'
const HASH_SECRET =
  '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c'
const AUTH_URL = 'https://oauth.secure.pixiv.net/auth/token'

/** Builds the x-client-hash header value for a given UTC timestamp string. */
export function buildClientHash(localTime: string): string {
  return md5(localTime + HASH_SECRET)
}

/**
 * Manages access tokens for the pixiv API.
 *
 * Holds the current access token and refresh token in memory.
 * The refresh() method exchanges the refresh token for a new access token
 * via the pixiv OAuth endpoint.
 */
export class AuthManager {
  #accessToken: string
  #refreshToken: string
  userId: string

  constructor(credentials: AuthCredentials) {
    this.#accessToken = credentials.accessToken
    this.#refreshToken = credentials.refreshToken
    this.userId = credentials.userId
  }

  /** Returns the current access token. */
  get accessToken(): string {
    return this.#accessToken
  }

  /** Returns the current refresh token. */
  get refreshToken(): string {
    return this.#refreshToken
  }

  /**
   * Exchanges the stored refresh token for a fresh access token.
   *
   * Updates the internal credentials on success.
   * Throws if the token endpoint returns a non-200 response.
   */
  async refresh(): Promise<void> {
    const localTime = new Date().toISOString().replace(/Z$/, '+00:00')

    const headers: Record<string, string> = {
      'x-client-time': localTime,
      'x-client-hash': buildClientHash(localTime),
      'app-os': 'ios',
      'app-os-version': '16.4.1',
      'user-agent': 'PixivIOSApp/7.16.9 (iOS 16.4.1; iPad13,4)',
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      get_secure_url: '1',
      grant_type: 'refresh_token',
      refresh_token: this.#refreshToken,
    }).toString()

    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers,
      body,
    })

    if (response.status !== 200) {
      throw new Error(
        `Failed to refresh pixiv token: HTTP ${response.status}`
      )
    }

    const data = (await response.json()) as {
      user: { id: string }
      response: { access_token: string; refresh_token: string }
    }

    this.#accessToken = data.response.access_token
    this.#refreshToken = data.response.refresh_token
    this.userId = data.user.id
  }

  /**
   * Creates an `AuthManager` by performing the initial token refresh.
   *
   * @param refreshToken - Pixiv refresh token
   * @returns Initialized `AuthManager`
   */
  static async login(refreshToken: string): Promise<AuthManager> {
    const manager = new AuthManager({
      userId: '',
      accessToken: '',
      refreshToken,
    })
    await manager.refresh()
    return manager
  }
}
