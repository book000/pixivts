/**
 * SpotlightResource — methods for the pixivision spotlight API namespace.
 */
import type { HttpClient } from '../http'
import { buildParams } from '../params'
import { PaginatedResultAsync } from '../paginated'
import { OSFilter } from '../options'
import type { SpotlightArticle, SpotlightArticlesPage } from '../types'

/** Parameters for fetching spotlight articles. */
export interface SpotlightArticlesParams {
  /**
   * Article category (default: `"all"`).
   *
   * `"all"` and `"manga"` are known to work. The full list of valid values is
   * not known; other values are rejected with HTTP 400.
   */
  category?: string
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Methods for the pixivision spotlight API namespace. */
export class SpotlightResource {
  readonly #http: HttpClient

  constructor(http: HttpClient) {
    this.#http = http
  }

  /**
   * Fetches pixivision spotlight articles.
   * GET /v1/spotlight/articles
   *
   * @param params - Request parameters
   */
  articles(
    params: SpotlightArticlesParams = {}
  ): PaginatedResultAsync<SpotlightArticlesPage, SpotlightArticle> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<SpotlightArticlesPage>(
        '/v1/spotlight/articles',
        buildParams({
          category: params.category ?? 'all',
          filter: params.filter ?? 'for_ios',
          offset: params.offset,
        })
      ),
      this.#http,
      (page) => page.spotlightArticles
    )
  }
}
