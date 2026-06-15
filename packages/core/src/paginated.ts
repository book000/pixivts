/**
 * PaginatedResultAsync — pagination support for the pixiv API.
 *
 * Extends `ResultAsync<TPage, PixivError>` so that:
 *   - `await paginated` returns the first-page `Result<TPage, PixivError>` directly
 *   - `.pages()` is an async generator that yields each page
 *   - `.items()` is an async generator that yields individual items across all pages
 *
 * Pagination uses the `nextUrl` field returned by list endpoints. The URL is
 * fetched via `HttpClient.getAbsolute()` which reuses the same auth / retry /
 * interceptor pipeline as regular requests.
 */

import type { HttpClient } from './http'
import type { PixivError } from './errors'
import { PixivFetchError } from './errors'
import { err } from './result'
import type { Result } from './result'
import { ResultAsync } from './result'

/**
 * A page returned by a pixiv list endpoint.
 *
 * Must have a `nextUrl` field (null when there are no more pages).
 */
export interface PagedResponse {
  /** URL to the next page, or `null` when there are no more pages. */
  nextUrl: string | null
}

/**
 * A `ResultAsync<TPage, PixivError>` with additional `.pages()` / `.items()`
 * async generators for consuming paginated pixiv list responses.
 *
 * Returned by all resource methods that produce a `nextUrl` field.
 */
export class PaginatedResultAsync<
  TPage extends PagedResponse,
  TItem,
> extends ResultAsync<TPage, PixivError> {
  readonly #http: HttpClient
  readonly #getItems: (page: TPage) => TItem[]

  constructor(
    promise: Promise<Result<TPage, PixivError>>,
    http: HttpClient,
    getItems: (page: TPage) => TItem[]
  ) {
    super(promise)
    this.#http = http
    this.#getItems = getItems
  }

  /**
   * Creates a `PaginatedResultAsync` from a `ResultAsync`.
   *
   * @param inner - The first-page result
   * @param http - HTTP client for fetching subsequent pages
   * @param getItems - Extracts item array from a page
   */
  static fromResultAsync<TPage extends PagedResponse, TItem>(
    inner: ResultAsync<TPage, PixivError>,
    http: HttpClient,
    getItems: (page: TPage) => TItem[]
  ): PaginatedResultAsync<TPage, TItem> {
    // Access the inner promise via the PromiseLike contract (await the ResultAsync)
    const promise = Promise.resolve(inner)
    return new PaginatedResultAsync<TPage, TItem>(promise, http, getItems)
  }

  /**
   * Async generator that yields each page starting from the first.
   *
   * If any page fetch fails, the generator throws a `PixivFetchError`.
   *
   * @example
   * ```ts
   * for await (const page of client.illusts.search({ word: 'cat' }).pages()) {
   *   console.log(page.illusts.length)
   * }
   * ```
   */
  async *pages(): AsyncGenerator<TPage, void, unknown> {
    // Yield first page
    const first = await Promise.resolve(this)
    if (first.isErr) throw new PixivFetchError(first.error)
    yield first.value

    // Follow nextUrl chain
    let nextUrl: string | null = first.value.nextUrl
    while (nextUrl !== null) {
      const pageResult = await this.#http.getAbsolute<TPage>(nextUrl)
      if (pageResult.isErr) throw new PixivFetchError(pageResult.error)
      yield pageResult.value
      nextUrl = pageResult.value.nextUrl
    }
  }

  /**
   * Async generator that yields individual items across all pages.
   *
   * If any page fetch fails, the generator throws a `PixivFetchError`.
   *
   * @example
   * ```ts
   * for await (const illust of client.illusts.search({ word: 'cat' }).items()) {
   *   console.log(illust.title)
   * }
   * ```
   */
  async *items(): AsyncGenerator<TItem, void, unknown> {
    for await (const page of this.pages()) {
      for (const item of this.#getItems(page)) {
        yield item
      }
    }
  }
}

/**
 * Creates an immediately-failed `PaginatedResultAsync`.
 *
 * Useful when validation or auth fails before any HTTP request is made.
 *
 * @param error - The error to return
 * @param http - HTTP client (used for signature compatibility)
 * @param getItems - Item extractor (used for signature compatibility)
 */
export function failedPaginated<TPage extends PagedResponse, TItem>(
  error: PixivError,
  http: HttpClient,
  getItems: (page: TPage) => TItem[]
): PaginatedResultAsync<TPage, TItem> {
  return new PaginatedResultAsync(
    Promise.resolve(err(error)),
    http,
    getItems
  )
}
