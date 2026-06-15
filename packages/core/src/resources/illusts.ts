/**
 * IllustResource — methods for the illust API namespace.
 */
import type { HttpClient } from '../http'
import type { PixivError } from '../errors'
import { buildParams } from '../params'
import { PaginatedResultAsync } from '../paginated'
import type { ResultAsync } from '../result'
import type {
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
export interface IllustDetailParams {
  /** ID of the illust to fetch. */
  illustId: number
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: OSFilter
}

/** Parameters for fetching related illusts. */
export interface IllustRelatedParams {
  /** ID of the illust for which to fetch related works. */
  illustId: number
  /** Additional seed illust IDs to influence recommendations. */
  seedIllustIds?: number[]
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: OSFilter
}

/** Parameters for searching illusts. */
export interface IllustSearchParams {
  /** Search keyword. */
  word: string
  /** How to match the keyword against works (default: `"partial_match_for_tags"`). */
  searchTarget?: SearchTarget
  /** Sort order for results (default: `"date_desc"`). */
  sort?: SearchSort
  /** Date range preset filter (omit for no restriction). */
  duration?: SearchDuration
  /** Start date for a custom date range (YYYY-MM-DD; requires `endDate`). */
  startDate?: string
  /** End date for a custom date range (YYYY-MM-DD; requires `startDate`). */
  endDate?: string
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: OSFilter
  /** AI-generated content filter: `0` = hide AI works, `1` = show only AI works. */
  searchAiType?: 0 | 1
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching the illust ranking. */
export interface IllustRankingParams {
  /** Ranking category (default: `"day"`). */
  mode?: RankingMode
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: OSFilter
  /** Specific date to fetch rankings for (YYYY-MM-DD; omit for the latest). */
  date?: string
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching recommended illusts. */
export interface IllustRecommendedParams {
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: OSFilter
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
}

/** Parameters for fetching an illust series. */
export interface IllustSeriesParams {
  /** ID of the illust series to fetch. */
  illustSeriesId: number
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: OSFilter
}

/** Parameters for adding an illust bookmark. */
export interface IllustBookmarkAddParams {
  /** ID of the illust to bookmark. */
  illustId: number
  /** Bookmark visibility (default: `"public"`). */
  restrict?: 'public' | 'private'
  /** Tags to attach to the bookmark. */
  tags?: string[]
}

/** Parameters for removing an illust bookmark. */
export interface IllustBookmarkDeleteParams {
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
   * @param params - Request parameters
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
    params: IllustDetailParams
  ): ResultAsync<IllustDetailResponse, PixivError> {
    return this.#http.get<IllustDetailResponse>(
      '/v1/illust/detail',
      buildParams({ illustId: params.illustId, filter: params.filter ?? 'for_ios' })
    )
  }

  /**
   * Fetches related illusts for a given illust.
   * GET /v2/illust/related
   *
   * @param params - Request parameters
   */
  related(
    params: IllustRelatedParams
  ): PaginatedResultAsync<IllustListPage, IllustListPage['illusts'][number]> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<IllustListPage>(
        '/v2/illust/related',
        buildParams({
          illustId: params.illustId,
          filter: params.filter ?? 'for_ios',
          ...(params.seedIllustIds
            ? { seedIllustIds: params.seedIllustIds }
            : {}),
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
   * @param params - Request parameters
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
    params: IllustSearchParams
  ): PaginatedResultAsync<IllustListPage, IllustListPage['illusts'][number]> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<IllustListPage>(
        '/v1/search/illust',
        buildParams({
          word: params.word,
          searchTarget: params.searchTarget ?? 'partial_match_for_tags',
          sort: params.sort ?? 'date_desc',
          filter: params.filter ?? 'for_ios',
          duration: params.duration,
          startDate: params.startDate,
          endDate: params.endDate,
          searchAiType: params.searchAiType,
          offset: params.offset,
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
   * @param params - Request parameters
   */
  ranking(
    params: IllustRankingParams = {}
  ): PaginatedResultAsync<IllustListPage, IllustListPage['illusts'][number]> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<IllustListPage>(
        '/v1/illust/ranking',
        buildParams({
          mode: params.mode ?? 'day',
          filter: params.filter ?? 'for_ios',
          date: params.date,
          offset: params.offset,
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
   * @param params - Request parameters
   */
  recommended(
    params: IllustRecommendedParams = {}
  ): PaginatedResultAsync<
    IllustRecommendedPage,
    IllustRecommendedPage['illusts'][number]
  > {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<IllustRecommendedPage>(
        '/v1/illust/recommended',
        buildParams({
          filter: params.filter ?? 'for_ios',
          includeRankingLabel: true,
          includeRankingIllusts: true,
          includePrivacyPolicy: true,
          offset: params.offset,
          maxBookmarkIdForRecommend: params.maxBookmarkIdForRecommend,
          minBookmarkIdForRecentIllust: params.minBookmarkIdForRecentIllust,
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
   * @param params - Request parameters
   */
  series(
    params: IllustSeriesParams
  ): PaginatedResultAsync<
    IllustSeriesPage,
    IllustSeriesPage['illusts'][number]
  > {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<IllustSeriesPage>(
        '/v1/illust/series',
        buildParams({
          illustSeriesId: params.illustSeriesId,
          filter: params.filter ?? 'for_ios',
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
   * @param params - Request parameters
   */
  bookmarkAdd(
    params: IllustBookmarkAddParams
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParams({
      illustId: params.illustId,
      restrict: params.restrict ?? 'public',
      ...(params.tags ? { tags: params.tags } : {}),
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
   * @param params - Request parameters
   */
  bookmarkDelete(
    params: IllustBookmarkDeleteParams
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParams({ illustId: String(params.illustId) })
    return this.#http.post<Record<string, never>>(
      '/v1/illust/bookmark/delete',
      body.toString()
    )
  }
}
