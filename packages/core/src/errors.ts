/**
 * Discriminated union of all errors that can occur when using the pixiv API client.
 *
 * Use the `type` field to discriminate:
 * ```ts
 * if (result.isErr()) {
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
