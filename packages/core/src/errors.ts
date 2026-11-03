/**
 * Discriminated union of all errors that can occur when using the pixiv API client.
 *
 * Use the `type` field to discriminate:
 * ```ts
 * if (result.isErr) {
 *   const err = result.error
 *   if (err.type === 'rate_limit') { ... }
 * }
 * ```
 */
export type PixivError =
  | {
      /** The request hit the rate limit and exhausted all retries. */
      type: 'rate_limit'
      /** Retry-After duration parsed from the last 429 response (milliseconds). */
      retryAfter: number
    }
  | {
      /** Authentication failed (401 response that could not be refreshed). */
      type: 'auth_failed'
      /** HTTP status code (always 401). */
      status: number
    }
  | {
      /** A network-level error occurred (fetch threw). */
      type: 'network'
      /** The underlying error thrown by fetch. */
      cause: unknown
    }
  | {
      /** The API returned a non-2xx status code other than 401/429. */
      type: 'api_error'
      /** HTTP status code. */
      status: number
      /** Parsed response body (object if JSON, string otherwise). */
      body: unknown
    }
  | {
      /** Structured data embedded in a non-JSON response could not be extracted or parsed. */
      type: 'parse_error'
      /** Description of what failed to parse. */
      message: string
      /** Raw response body that failed to parse. */
      body: string
      /** The underlying error thrown during parsing, if any (e.g. a `SyntaxError` from `JSON.parse`). */
      cause?: unknown
    }

// ---------------------------------------------------------------------------
// PixivFetchError — a proper Error subclass wrapping PixivError
// ---------------------------------------------------------------------------

/**
 * An `Error` subclass that wraps a `PixivError` for use in thrown contexts
 * (e.g. async generators that must throw proper `Error` objects).
 *
 * All `PixivError` properties are spread directly onto this instance so that
 * callers can use `instanceof PixivFetchError` or access `error.type` etc.
 *
 * @example
 * ```ts
 * try {
 *   for await (const page of result.pages()) { ... }
 * } catch (e) {
 *   if (e instanceof PixivFetchError) {
 *     console.error(e.pixivError.type)
 *   }
 * }
 * ```
 */
export class PixivFetchError extends Error {
  /** The underlying structured `PixivError`. */
  readonly pixivError: PixivError

  constructor(pixivError: PixivError) {
    super(`pixiv API error: ${pixivError.type}`)
    this.name = 'PixivFetchError'
    this.pixivError = pixivError
    // Spread PixivError fields onto this instance for backwards compatibility
    // with code that matches thrown values via { type, status, ... }.
    Object.assign(this, pixivError)
  }
}

// ---------------------------------------------------------------------------
// PixivAuthError — thrown when the OAuth token refresh fails
// ---------------------------------------------------------------------------

const MAX_AUTH_BODY_LENGTH = 200

/** Truncates a raw response body and redacts token-like strings. */
function sanitizeAuthBody(raw: string): string {
  const redacted = raw.replaceAll(/[\w-]{20,}/g, '[REDACTED]')
  return redacted.length > MAX_AUTH_BODY_LENGTH
    ? `${redacted.slice(0, MAX_AUTH_BODY_LENGTH)}...`
    : redacted
}

/**
 * Thrown by `AuthManager.refresh()` when the token endpoint returns a non-200
 * response. The message keeps the `Failed to refresh pixiv token: HTTP <status>`
 * prefix and appends the error code when one is available (for example
 * `invalid_grant` for a revoked refresh token).
 */
export class PixivAuthError extends Error {
  /** HTTP status code of the token endpoint response. */
  readonly status: number
  /** OAuth `error` code or pixiv `errors.system.message`, if present in the JSON body. */
  readonly code?: string
  /** Truncated response body with token-like strings redacted. */
  readonly body: string

  constructor(status: number, rawBody: string) {
    let code: string | undefined
    try {
      const json = JSON.parse(rawBody) as {
        error?: unknown
        errors?: { system?: { message?: unknown } }
      }
      const c = json.error ?? json.errors?.system?.message
      if (typeof c === 'string') code = sanitizeAuthBody(c)
    } catch {
      // Not JSON; keep only the sanitized body.
    }
    super(
      `Failed to refresh pixiv token: HTTP ${status}${code ? ` (${code})` : ''}`
    )
    this.name = 'PixivAuthError'
    this.status = status
    this.code = code
    this.body = sanitizeAuthBody(rawBody)
  }
}

// ---------------------------------------------------------------------------
// Constructor helpers (not strictly required but improve call-sites)
// ---------------------------------------------------------------------------

/** Creates a rate-limit error. */
export function rateLimitError(retryAfter: number): PixivError {
  return { type: 'rate_limit', retryAfter }
}

/** Creates an auth-failed error. */
export function authFailedError(status: number): PixivError {
  return { type: 'auth_failed', status }
}

/** Creates a network error. */
export function networkError(cause: unknown): PixivError {
  return { type: 'network', cause }
}

/** Creates an API error. */
export function apiError(status: number, body: unknown): PixivError {
  return { type: 'api_error', status, body }
}

/** Creates a parse error. */
export function parseError(
  message: string,
  body: string,
  cause?: unknown
): PixivError {
  return { type: 'parse_error', message, body, cause }
}
