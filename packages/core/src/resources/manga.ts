/**
 * MangaResource — methods for the manga API namespace.
 */
import type { HttpClient } from '../http'
import { buildParams } from '../params'
import { PaginatedResultAsync } from '../paginated'
import { OSFilter } from '../options'
import type { MangaRecommendedPage, PixivIllustItem } from '../types'

/** Parameters for fetching recommended manga. */
export interface MangaRecommendedParams {
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Methods for the manga API namespace. */
export class MangaResource {
  readonly #http: HttpClient

  constructor(http: HttpClient) {
    this.#http = http
  }

  /**
   * Fetches recommended manga.
   * GET /v1/manga/recommended
   *
   * @param params - Request parameters
   */
  recommended(
    params: MangaRecommendedParams = {}
  ): PaginatedResultAsync<MangaRecommendedPage, PixivIllustItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<MangaRecommendedPage>(
        '/v1/manga/recommended',
        buildParams({
          filter: params.filter ?? 'for_ios',
          includeRankingIllusts: true,
          includePrivacyPolicy: true,
          offset: params.offset,
        })
      ),
      this.#http,
      (page) => page.illusts
    )
  }
}
