/**
 * Response interceptor types for the pixiv API client.
 *
 * The interceptor is the seam that connects `@book000/pixivts-db-mysql`
 * (or any other storage backend) to the HTTP layer without introducing a
 * runtime dependency in core.
 *
 * Usage:
 * ```ts
 * import { createResponseRecorder } from '@book000/pixivts-db-mysql'
 * const { interceptor, close } = await createResponseRecorder({ ... })
 * const client = await PixivClient.of(token, { onResponse: interceptor })
 * ```
 */

/** HTTP method of the request. */
export type HttpMethod = 'GET' | 'POST'

/**
 * A single API response record passed to the interceptor after every successful
 * HTTP call made by the pixiv client.
 */
export interface ResponseRecord {
  /** HTTP method used for the request. */
  method: HttpMethod

  /** API endpoint path (e.g. "/v1/illust/detail"). */
  endpoint: string

  /** Full request URL including query string (null if unavailable). */
  url: string | null

  /** JSON-serialized request headers (null if unavailable). */
  requestHeaders: string | null

  /** URL-encoded request body for POST requests (null for GET). */
  requestBody: string | null

  /** Whether the response body was parsed as JSON or left as plain text. */
  responseType: 'JSON' | 'TEXT'

  /** HTTP response status code. */
  statusCode: number

  /** JSON-serialized response headers (null if unavailable). */
  responseHeaders: string | null

  /** Serialized response body. */
  responseBody: string
}

/**
 * A callback invoked after every successful API response.
 *
 * Implementations should be non-blocking — awaiting a slow DB write here will
 * add latency to every API call.  Consider queueing the record and writing
 * asynchronously if persistence latency matters.
 */
export type ResponseInterceptor = (
  record: ResponseRecord
) => void | Promise<void>
