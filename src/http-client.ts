import qs from 'qs'
import { PixivRateLimitError } from './types/errors'

/**
 * Retry settings for 429 errors.
 */
export interface PixivRateLimitRetryOptions {
  /**
   * Maximum number of retries when a request hits the rate limit.
   */
  maxRetries: number

  /**
   * Wait time (in milliseconds) before retrying when a request hits the rate limit.
   */
  waitMs: number
}

/**
 * Response to a request to the pixiv API.
 */
export interface PixivApiResponse<T> {
  data: T
  status: number
  headers: Record<string, string>
  requestHeaders: Record<string, string>
  requestBody: string | null
  responseUrl: string | undefined
}

function headersToRecord(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of headers) {
    result[key] = value
  }
  return result
}

/**
 * Calculates the wait time (in milliseconds) from the value of the Retry-After header.
 * Supports both the delay-seconds format and the HTTP-date format,
 * and returns the default wait time (waitMs) if neither format can be parsed.
 *
 * @param retryAfter - Value of the Retry-After header (null if not specified)
 * @param waitMs - Default wait time (in milliseconds)
 * @returns Wait time (in milliseconds)
 */
function getRetryAfterWaitTime(
  retryAfter: string | null,
  waitMs: number
): number {
  if (!retryAfter) {
    return waitMs
  }

  // delay-seconds format
  if (/^\d+$/.test(retryAfter.trim())) {
    return Number.parseInt(retryAfter, 10) * 1000
  }

  // HTTP-date format (e.g. "Wed, 21 Oct 2026 07:28:00 GMT")
  const retryDate = Date.parse(retryAfter)
  if (!Number.isNaN(retryDate)) {
    return Math.max(0, retryDate - Date.now())
  }

  return waitMs
}

/**
 * Client that performs HTTP requests to the pixiv API.
 *
 * When a 429 (rate limit) response is received, it automatically retries
 * based on the Retry-After header or the configured wait time.
 */
export class PixivHttpClient {
  private readonly baseURL: string
  private readonly defaultHeaders: Record<string, string>
  private readonly rateLimitRetryOptions: PixivRateLimitRetryOptions | null

  /**
   * Constructor.
   *
   * @param baseURL Base URL for requests
   * @param headers Default headers to attach to all requests
   * @param rateLimitRetryOptions Retry settings for 429 errors
   */
  constructor(
    baseURL: string,
    headers: Record<string, string>,
    rateLimitRetryOptions?: PixivRateLimitRetryOptions | null
  ) {
    this.baseURL = baseURL
    this.defaultHeaders = headers
    this.rateLimitRetryOptions = rateLimitRetryOptions ?? null
  }

  /**
   * Sends a GET request.
   *
   * @param path Request path
   * @param options Options such as query parameters
   * @returns Response
   */
  async get<U>(
    path: string,
    options: { params?: Record<string, any> } = {}
  ): Promise<PixivApiResponse<U>> {
    let url = `${this.baseURL}${path}`
    if (options.params) {
      const queryString = qs.stringify(options.params)
      if (queryString) url += `?${queryString}`
    }
    const response = await this.fetchWithRetry(url, {
      headers: this.defaultHeaders,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const text = await response.text()
    const data = (
      contentType.includes('application/json') ? JSON.parse(text) : text
    ) as U
    return {
      data,
      status: response.status,
      headers: headersToRecord(response.headers),
      requestHeaders: this.defaultHeaders,
      requestBody: null,
      responseUrl: response.url || undefined,
    }
  }

  /**
   * Sends a POST request.
   *
   * @param path Request path
   * @param body Request body
   * @param options Options such as headers
   * @returns Response
   */
  async post<U>(
    path: string,
    body: string,
    options: { headers?: Record<string, string> } = {}
  ): Promise<PixivApiResponse<U>> {
    const url = `${this.baseURL}${path}`
    const headers = { ...this.defaultHeaders, ...options.headers }
    const response = await this.fetchWithRetry(url, {
      method: 'POST',
      headers,
      body,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const text = await response.text()
    const data = (
      contentType.includes('application/json') ? JSON.parse(text) : text
    ) as U
    return {
      data,
      status: response.status,
      headers: headersToRecord(response.headers),
      requestHeaders: headers,
      requestBody: body,
      responseUrl: response.url || undefined,
    }
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    // Clamp to 0 or higher so the loop always runs at least once, even if a negative value is passed
    const maxRetries = Math.max(0, this.rateLimitRetryOptions?.maxRetries ?? 3)
    // Clamp to 0 or higher so the setTimeout wait time is never negative, even if a negative value is passed
    const waitMs = Math.max(0, this.rateLimitRetryOptions?.waitMs ?? 10_000) // default 10 sec

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const response = await fetch(url, options)
      if (response.status !== 429) {
        return response
      }

      // The response body of a 429 is unused, so discard it to release the connection
      await response.body?.cancel()

      if (attempt < maxRetries) {
        const retryAfter = response.headers.get('Retry-After')
        const waitTime = getRetryAfterWaitTime(retryAfter, waitMs)

        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }

    throw new PixivRateLimitError('Rate limit exceeded after maximum retries')
  }
}
