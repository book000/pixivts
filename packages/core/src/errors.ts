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
