/**
 * IllustResource — methods for the illust API namespace.
 */
import type { HttpClient } from '../http'
import type { PixivError } from '../errors'
import { buildParameters } from '../parameters'
import { PaginatedResultAsync } from '../paginated'
import type { ResultAsync } from '../result'
import {
  BookmarkRestrict,
  OSFilter,
  RankingMode,
  SearchDuration,
  SearchSort,
  SearchTarget,
} from '../options'
import type {
  IllustDetailResponse,
  IllustListPage,
  IllustRecommendedPage,
  IllustSeriesPage,
} from '../types'

// === Request param types ===

/** Parameters for fetching a single illust by ID. */
export interface IllustDetailParameters {
  /** ID of the illust to fetch. */
  illustId: number
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
}

/** Parameters for fetching related illusts. */
export interface IllustRelatedParameters {
  /** ID of the illust for which to fetch related works. */
  illustId: number
  /** Additional seed illust IDs to influence recommendations. */
  seedIllustIds?: number[]
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
}

/** Parameters for searching illusts. */
export interface IllustSearchParameters {
  /** Search keyword. */
  word: string
  /** How to match the keyword against works (default: `"partial_match_for_tags"`). */
  searchTarget?: (typeof SearchTarget)[keyof typeof SearchTarget]
  /** Sort order for results (default: `"date_desc"`). */
  sort?: (typeof SearchSort)[keyof typeof SearchSort]
  /** Date range preset filter (omit for no restriction). */
  duration?: (typeof SearchDuration)[keyof typeof SearchDuration]
  /** Start date for a custom date range (YYYY-MM-DD; requires `endDate`). */
  startDate?: string
  /** End date for a custom date range (YYYY-MM-DD; requires `startDate`). */
  endDate?: string
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** AI-generated content filter: `0` = hide AI works, `1` = show only AI works. */
  searchAiType?: 0 | 1
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching the illust ranking. */
export interface IllustRankingParameters {
  /** Ranking category (default: `"day"`). */
  mode?: (typeof RankingMode)[keyof typeof RankingMode]
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Specific date to fetch rankings for (YYYY-MM-DD; omit for the latest). */
  date?: string
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching recommended illusts. */
export interface IllustRecommendedParameters {
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Zero-based offset for pagination. */
  offset?: number
  /**
   * Cursor for resuming pagination: the `maxBookmarkIdForRecommend` value
   * extracted from a previous page's `next_url` via {@link parseNextUrl}.
   */
  maxBookmarkIdForRecommend?: number
  /**
   * Secondary cursor for resuming pagination: the `minBookmarkIdForRecentIllust`
   * value extracted from a previous page's `next_url` via {@link parseNextUrl}.
   */
  minBookmarkIdForRecentIllust?: number
  /**
   * Content type filter for recommended works.
   * - `"illust"` — illustration works only
   * - `"manga"` — manga works only
   * Omit to receive both types.
   */
  contentType?: 'illust' | 'manga'
  /**
   * Whether to include ranking label information in the response.
   * Defaults to `true` when omitted.
   */
  includeRankingLabel?: boolean
  /**
   * IDs of illusts already seen by the user.
   * The API will exclude these from the recommendations.
   * Serialised as repeated `viewed[]=<id>` query parameters.
   */
  viewed?: number[]
}

/** Parameters for fetching an illust series. */
export interface IllustSeriesParameters {
  /** ID of the illust series to fetch. */
  illustSeriesId: number
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
}

/** Parameters for adding an illust bookmark. */
export interface IllustBookmarkAddParameters {
  /** ID of the illust to bookmark. */
  illustId: number
  /** Bookmark visibility (default: `"public"`). */
  restrict?: (typeof BookmarkRestrict)[keyof typeof BookmarkRestrict]
  /** Tags to attach to the bookmark. */
  tags?: string[]
}

/** Parameters for removing an illust bookmark. */
export interface IllustBookmarkDeleteParameters {
  /** ID of the illust to remove from bookmarks. */
  illustId: number
}

/** Methods for the illust API namespace. */
export class IllustResource {
  readonly #http: HttpClient

  constructor(http: HttpClient) {
    this.#http = http
  }

  /**
   * Fetches a single illust by ID.
   * GET /v1/illust/detail
   *
   * @param parameters - Request parameters
   *
   * @example
   * ```ts
   * const result = await client.illusts.detail({ illustId: 12345 })
   * if (result.isOk) {
   *   console.log(result.value.illust.title)
   * } else {
   *   console.error(result.error)
   * }
   * ```
   */
  detail(
    parameters: IllustDetailParameters
  ): ResultAsync<IllustDetailResponse, PixivError> {
    return this.#http.get<IllustDetailResponse>(
      '/v1/illust/detail',
      buildParameters({
        illustId: parameters.illustId,
        filter: parameters.filter ?? 'for_ios',
      })
    )
  }

  /**
   * Fetches related illusts for a given illust.
   * GET /v2/illust/related
   *
   * @param parameters - Request parameters
   */
  related(
    parameters: IllustRelatedParameters
  ): PaginatedResultAsync<IllustListPage, IllustListPage['illusts'][number]> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<IllustListPage>(
        '/v2/illust/related',
        buildParameters({
          illustId: parameters.illustId,
          filter: parameters.filter ?? 'for_ios',
          ...(parameters.seedIllustIds && {
            seedIllustIds: parameters.seedIllustIds,
          }),
        })
      ),
      this.#http,
      (page) => page.illusts
    )
  }

  /**
   * Searches for illusts.
   * GET /v1/search/illust
   *
   * @param parameters - Request parameters
   *
   * @example
   * ```ts
   * // Iterate all results across pages
   * for await (const illust of client.illusts.search({ word: 'cat' }).items()) {
   *   console.log(illust.title)
   * }
   *
   * // Fetch only the first page
   * const page = await client.illusts.search({ word: 'cat' })
   * if (page.isOk) {
   *   console.log(page.value.illusts.length)
   * }
   * ```
   */
  search(
    parameters: IllustSearchParameters
  ): PaginatedResultAsync<IllustListPage, IllustListPage['illusts'][number]> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<IllustListPage>(
        '/v1/search/illust',
        buildParameters({
          word: parameters.word,
          searchTarget: parameters.searchTarget ?? 'partial_match_for_tags',
          sort: parameters.sort ?? 'date_desc',
          filter: parameters.filter ?? 'for_ios',
          duration: parameters.duration,
          startDate: parameters.startDate,
          endDate: parameters.endDate,
          searchAiType: parameters.searchAiType,
          offset: parameters.offset,
        })
      ),
      this.#http,
      (page) => page.illusts
    )
  }

  /**
   * Fetches the illust ranking.
   * GET /v1/illust/ranking
   *
   * @param parameters - Request parameters
   */
  ranking(
    parameters: IllustRankingParameters = {}
  ): PaginatedResultAsync<IllustListPage, IllustListPage['illusts'][number]> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<IllustListPage>(
        '/v1/illust/ranking',
        buildParameters({
          mode: parameters.mode ?? 'day',
          filter: parameters.filter ?? 'for_ios',
          date: parameters.date,
          offset: parameters.offset,
        })
      ),
      this.#http,
      (page) => page.illusts
    )
  }

  /**
   * Fetches recommended illusts.
   * GET /v1/illust/recommended
   *
   * @param parameters - Request parameters
   */
  recommended(
    parameters: IllustRecommendedParameters = {}
  ): PaginatedResultAsync<
    IllustRecommendedPage,
    IllustRecommendedPage['illusts'][number]
  > {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<IllustRecommendedPage>(
        '/v1/illust/recommended',
        buildParameters({
          filter: parameters.filter ?? 'for_ios',
          contentType: parameters.contentType,
          includeRankingLabel: parameters.includeRankingLabel ?? true,
          includeRankingIllusts: true,
          includePrivacyPolicy: true,
          offset: parameters.offset,
          maxBookmarkIdForRecommend: parameters.maxBookmarkIdForRecommend,
          minBookmarkIdForRecentIllust: parameters.minBookmarkIdForRecentIllust,
          ...(parameters.viewed && { viewed: parameters.viewed }),
        })
      ),
      this.#http,
      (page) => page.illusts
    )
  }

  /**
   * Fetches an illust series.
   * GET /v1/illust/series
   *
   * @param parameters - Request parameters
   */
  series(
    parameters: IllustSeriesParameters
  ): PaginatedResultAsync<
    IllustSeriesPage,
    IllustSeriesPage['illusts'][number]
  > {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<IllustSeriesPage>(
        '/v1/illust/series',
        buildParameters({
          illustSeriesId: parameters.illustSeriesId,
          filter: parameters.filter ?? 'for_ios',
        })
      ),
      this.#http,
      (page) => page.illusts
    )
  }

  /**
   * Adds an illust bookmark.
   * POST /v2/illust/bookmark/add
   *
   * @param parameters - Request parameters
   */
  bookmarkAdd(
    parameters: IllustBookmarkAddParameters
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParameters({
      illustId: parameters.illustId,
      restrict: parameters.restrict ?? 'public',
      ...(parameters.tags && { tags: parameters.tags }),
    })
    return this.#http.post<Record<string, never>>(
      '/v2/illust/bookmark/add',
      body.toString()
    )
  }

  /**
   * Removes an illust bookmark.
   * POST /v1/illust/bookmark/delete
   *
   * @param parameters - Request parameters
   */
  bookmarkDelete(
    parameters: IllustBookmarkDeleteParameters
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParameters({ illustId: String(parameters.illustId) })
    return this.#http.post<Record<string, never>>(
      '/v1/illust/bookmark/delete',
      body.toString()
    )
  }
}
