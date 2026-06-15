/**
 * HTTP client for the pixiv API.
 *
 * Wraps the global `fetch` API and adds:
 *   - 429 retry with Retry-After header parsing
 *   - 401 → token refresh → single retry
 *   - Response interceptor hook (for optional DB recording)
 *   - Image fetch helper (browser UA, Referer, no auth)
 */

import type { AuthManager } from './auth'
import { apiError, authFailedError, networkError, rateLimitError } from './errors'
import type { ResponseInterceptor } from './interceptor'
import { type HttpMethod, type ResponseRecord } from './interceptor'
import { err, ok, ResultAsync } from './result'
import type { PixivError } from './errors'
import type { Result } from './result'

/** Options for controlling retry behaviour on rate-limited requests. */
export interface RateLimitRetryOptions {
  /** Maximum number of retries when a 429 response is received. Defaults to 3. */
  maxRetries: number
  /** Default wait time (ms) used when no Retry-After header is present. Defaults to 10_000. */
  waitMs: number
}

/** Raw response data returned by the HTTP client. */
export interface HttpResponse<T> {
  /** Parsed response body. */
  data: T
  /** HTTP response status code. */
  status: number
  /** Response headers. */
  headers: Record<string, string>
  /** Request headers that were sent. */
  requestHeaders: Record<string, string>
  /** URL-encoded request body (null for GET requests). */
  requestBody: string | null
  /** Final URL after any redirects (may be undefined if unavailable). */
  responseUrl: string | undefined
  /** API endpoint path (e.g. `/v1/illust/detail`). */
  endpoint: string
}

const DEFAULT_RETRY: RateLimitRetryOptions = { maxRetries: 3, waitMs: 10_000 }

const BASE_URL = 'https://app-api.pixiv.net'

const DEFAULT_HEADERS: Record<string, string> = {
  Host: 'app-api.pixiv.net',
  'App-OS': 'ios',
  'App-OS-Version': '14.6',
  'User-Agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
  'Accept-Language': 'ja',
}

/**
 * Parses the `Retry-After` header value into milliseconds.
 *
 * Supports delay-seconds format and HTTP-date format.
 * Falls back to `defaultMs` if the header is absent or unparseable.
 *
 * @param retryAfter - Header value (null if not present)
 * @param defaultMs - Fallback wait time in milliseconds
 * @returns Wait time in milliseconds (clamped to ≥ 0)
 */
export function parseRetryAfter(
  retryAfter: string | null,
  defaultMs: number
): number {
  if (!retryAfter) return defaultMs

  // delay-seconds format
  if (/^\d+$/.test(retryAfter.trim())) {
    return Number.parseInt(retryAfter, 10) * 1000
  }

  // HTTP-date format (e.g. "Wed, 21 Oct 2026 07:28:00 GMT")
  const retryDate = Date.parse(retryAfter)
  if (!Number.isNaN(retryDate)) {
    return Math.max(0, retryDate - Date.now())
  }

  return defaultMs
}

function headersToRecord(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of headers) {
    result[key] = value
  }
  return result
}

/**
 * HTTP client for the pixiv API.
 *
 * All methods return `ResultAsync<T, PixivError>` — no throws.
 * A 429 → retry loop and a 401 → refresh → retry are handled internally.
 */
export class HttpClient {
  readonly #auth: AuthManager
  readonly #retry: RateLimitRetryOptions
  readonly #interceptor: ResponseInterceptor | undefined

  constructor(
    auth: AuthManager,
    options?: {
      retry?: Partial<RateLimitRetryOptions>
      onResponse?: ResponseInterceptor
    }
  ) {
    this.#auth = auth
    this.#retry = {
      maxRetries: options?.retry?.maxRetries ?? DEFAULT_RETRY.maxRetries,
      waitMs: options?.retry?.waitMs ?? DEFAULT_RETRY.waitMs,
    }
    this.#interceptor = options?.onResponse
  }

  /**
   * Sends a GET request to the pixiv API.
   *
   * @param path - API endpoint path (e.g. "/v1/illust/detail")
   * @param params - Query parameters as a URLSearchParams instance
   * @returns `ResultAsync<T, PixivError>`
   */
  get<T>(path: string, params?: URLSearchParams): ResultAsync<T, PixivError> {
    const qs = params ? `?${params.toString()}` : ''
    const url = `${BASE_URL}${path}${qs}`
    return this.#send<T>(url, 'GET', path, undefined)
  }

  /**
   * Sends a POST request to the pixiv API.
   *
   * @param path - API endpoint path (e.g. "/v2/illust/bookmark/add")
   * @param body - URL-encoded request body string
   * @returns `ResultAsync<T, PixivError>`
   */
  post<T>(path: string, body: string): ResultAsync<T, PixivError> {
    const url = `${BASE_URL}${path}`
    return this.#send<T>(url, 'POST', path, body)
  }

  /**
   * Fetches a pixiv image URL without an Authorization header.
   *
   * Uses a browser User-Agent and the pixiv Referer, which are required for
   * image CDN access. Retry and interceptor are not applied here.
   *
   * @param imageUrl - Full image URL
   * @returns `ResultAsync<Response, PixivError>`
   */
  fetchImage(imageUrl: string): ResultAsync<Response, PixivError> {
    return ResultAsync.fromPromise(
      fetch(imageUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
          Referer: 'https://www.pixiv.net/',
        },
      }),
      networkError
    ).andThen((response) => {
      if (!response.ok) {
        return ResultAsync.fromResult(
          err(apiError(response.status, null))
        )
      }
      return ResultAsync.fromResult(ok(response) as Result<Response, PixivError>)
    })
  }

  /**
   * Sends a request to an absolute URL returned in a `next_url` field.
   *
   * Applies the same retry / interceptor / auth logic as `get()`.
   *
   * @param absoluteUrl - Full URL including query string
   * @returns `ResultAsync<T, PixivError>`
   */
  getAbsolute<T>(absoluteUrl: string): ResultAsync<T, PixivError> {
    // Extract the endpoint path for the interceptor record
    let endpoint: string
    try {
      endpoint = new URL(absoluteUrl).pathname
    } catch {
      endpoint = absoluteUrl
    }
    return this.#send<T>(absoluteUrl, 'GET', endpoint, undefined)
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  #send<T>(
    url: string,
    method: HttpMethod,
    endpoint: string,
    body: string | undefined
  ): ResultAsync<T, PixivError> {
    return new ResultAsync(this.#sendWithRetry(url, method, endpoint, body))
  }

  async #sendWithRetry<T>(
    url: string,
    method: HttpMethod,
    endpoint: string,
    body: string | undefined,
    allowRefresh = true
  ): Promise<Result<T, PixivError>> {
    const maxRetries = Math.max(0, this.#retry.maxRetries)
    const waitMs = Math.max(0, this.#retry.waitMs)

    let lastRetryAfterMs = 0

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const requestHeaders: Record<string, string> = {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${this.#auth.accessToken}`,
        ...(method === 'POST'
          ? { 'Content-Type': 'application/x-www-form-urlencoded' }
          : {}),
      }

      let response: Response
      try {
        response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: method === 'POST' ? body : undefined,
        })
      } catch (fetchError: unknown) {
        return err(networkError(fetchError))
      }

      // 429 Rate limit
      if (response.status === 429) {
        await response.body?.cancel()
        const retryAfterMs = parseRetryAfter(
          response.headers.get('Retry-After'),
          waitMs
        )
        lastRetryAfterMs = retryAfterMs

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryAfterMs))
          continue
        }

        return err(rateLimitError(lastRetryAfterMs))
      }

      // 401 Auth failed → try token refresh once
      if (response.status === 401) {
        await response.body?.cancel()
        if (allowRefresh) {
          try {
            await this.#auth.refresh()
          } catch {
            return err(authFailedError(401))
          }
          // Retry once with the new token (no further refresh allowed)
          return this.#sendWithRetry<T>(url, method, endpoint, body, false)
        }
        return err(authFailedError(401))
      }

      // Parse response body
      const contentType = response.headers.get('content-type') ?? ''
      const text = await response.text()
      let data: T
      const isJson = contentType.includes('application/json')
      if (isJson) {
        try {
          data = JSON.parse(text) as T
        } catch {
          data = text as unknown as T
        }
      } else {
        data = text as unknown as T
      }

      const responseHeaders = headersToRecord(response.headers)

      // Non-2xx errors
      if (!response.ok) {
        return err(apiError(response.status, data))
      }

      const httpResponse: HttpResponse<T> = {
        data,
        status: response.status,
        headers: responseHeaders,
        requestHeaders,
        requestBody: body ?? null,
        responseUrl: response.url || undefined,
        endpoint,
      }

      // Notify interceptor (fire-and-forget, errors do not fail the request)
      if (this.#interceptor) {
        const record: ResponseRecord = {
          method,
          endpoint,
          url: response.url || url,
          requestHeaders: JSON.stringify(requestHeaders),
          requestBody: body ?? null,
          responseType: isJson ? 'JSON' : 'TEXT',
          statusCode: response.status,
          responseHeaders: JSON.stringify(responseHeaders),
          responseBody: isJson ? JSON.stringify(data) : text,
        }
        Promise.resolve(this.#interceptor(record)).catch(() => undefined)
      }

      return ok(httpResponse.data)
    }

    return err(rateLimitError(lastRetryAfterMs))
  }
}
