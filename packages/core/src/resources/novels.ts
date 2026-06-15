/**
 * NovelResource — methods for the novel API namespace.
 */
import type { HttpClient } from '../http'
import type { PixivError } from '../errors'
import { buildParams } from '../params'
import { PaginatedResultAsync } from '../paginated'
import type { ResultAsync } from '../result'
import {
  BookmarkRestrict,
  NovelRankingMode,
  OSFilter,
  SearchDuration,
  SearchSort,
  SearchTarget,
} from '../options'
import type {
  NovelDetailResponse,
  NovelListPage,
  NovelRecommendedPage,
  NovelSeriesPage,
  PixivNovelItem,
} from '../types'

// === Request param types ===

/** Parameters for fetching a single novel by ID. */
export interface NovelDetailParams {
  /** ID of the novel to fetch. */
  novelId: number
}

/** Parameters for fetching the WebView HTML of a novel. */
export interface NovelTextParams {
  /** ID of the novel whose WebView HTML to fetch. */
  novelId: number
}

/** Parameters for fetching related novels. */
export interface NovelRelatedParams {
  /** ID of the novel for which to fetch related works. */
  novelId: number
}

/** Parameters for searching novels. */
export interface NovelSearchParams {
  /** Search keyword. */
  word: string
  /** How to match the keyword against works (default: `"partial_match_for_tags"`). */
  searchTarget?: (typeof SearchTarget)[keyof typeof SearchTarget]
  /** Sort order for results (default: `"date_desc"`). */
  sort?: (typeof SearchSort)[keyof typeof SearchSort]
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Date range preset filter (omit for no restriction). */
  duration?: (typeof SearchDuration)[keyof typeof SearchDuration]
  /** Start date for a custom date range (YYYY-MM-DD; requires `endDate`). */
  startDate?: string
  /** End date for a custom date range (YYYY-MM-DD; requires `startDate`). */
  endDate?: string
  /** AI-generated content filter: `0` = hide AI works, `1` = show only AI works. */
  searchAiType?: 0 | 1
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching the novel ranking. */
export interface NovelRankingParams {
  /** Ranking category (default: `"day"`). */
  mode?: (typeof NovelRankingMode)[keyof typeof NovelRankingMode]
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Specific date to fetch rankings for (YYYY-MM-DD; omit for the latest). */
  date?: string
  /** Zero-based offset for pagination. */
  offset?: number
}

/** Parameters for fetching recommended novels. */
export interface NovelRecommendedParams {
  /** OS filter to apply (default: `"for_ios"`). */
  filter?: (typeof OSFilter)[keyof typeof OSFilter]
  /** Zero-based offset for pagination. */
  offset?: number
  /**
   * Cursor for resuming pagination: the `maxBookmarkIdForRecommend` value
   * extracted from a previous page's `next_url` via {@link parseNextUrl}.
   */
  maxBookmarkIdForRecommend?: number
}

/** Parameters for fetching a novel series. */
export interface NovelSeriesParams {
  /** ID of the novel series to fetch. */
  seriesId: number
  /** Order of the last novel already seen; used for cursor-based pagination. */
  lastOrder?: number
}

/** Parameters for adding a novel bookmark. */
export interface NovelBookmarkAddParams {
  /** ID of the novel to bookmark. */
  novelId: number
  /** Bookmark visibility (default: `"public"`). */
  restrict?: (typeof BookmarkRestrict)[keyof typeof BookmarkRestrict]
  /** Tags to attach to the bookmark. */
  tags?: string[]
}

/** Parameters for removing a novel bookmark. */
export interface NovelBookmarkDeleteParams {
  /** ID of the novel to remove from bookmarks. */
  novelId: number
}

/** Methods for the novel API namespace. */
export class NovelResource {
  readonly #http: HttpClient

  constructor(http: HttpClient) {
    this.#http = http
  }

  /**
   * Fetches a single novel by ID.
   * GET /v2/novel/detail
   *
   * @param params - Request parameters
   *
   * @example
   * ```ts
   * const result = await client.novels.detail({ novelId: 67890 })
   * if (result.isOk) {
   *   console.log(result.value.novel.title)
   * } else {
   *   console.error(result.error)
   * }
   * ```
   */
  detail(
    params: NovelDetailParams
  ): ResultAsync<NovelDetailResponse, PixivError> {
    return this.#http.get<NovelDetailResponse>(
      '/v2/novel/detail',
      buildParams({ novelId: params.novelId })
    )
  }

  /**
   * Fetches the WebView HTML for a novel.
   * GET /webview/v2/novel
   *
   * Returns the raw HTML page that the pixiv app renders in a WebView.
   * To extract the plain text, parse the returned HTML (e.g. strip tags).
   *
   * @param params - Request parameters
   */
  text(params: NovelTextParams): ResultAsync<string, PixivError> {
    return this.#http.get<string>(
      '/webview/v2/novel',
      // The webview endpoint uses the query parameter 'id', not 'novel_id'
      buildParams({ id: params.novelId })
    )
  }

  /**
   * Fetches related novels for a given novel.
   * GET /v1/novel/related
   *
   * @param params - Request parameters
   */
  related(
    params: NovelRelatedParams
  ): PaginatedResultAsync<NovelListPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<NovelListPage>(
        '/v1/novel/related',
        buildParams({ novelId: params.novelId })
      ),
      this.#http,
      (page) => page.novels
    )
  }

  /**
   * Searches for novels.
   * GET /v1/search/novel
   *
   * @param params - Request parameters
   *
   * @example
   * ```ts
   * // Iterate all results across pages
   * for await (const novel of client.novels.search({ word: 'fantasy' }).items()) {
   *   console.log(novel.title)
   * }
   *
   * // Fetch only the first page
   * const page = await client.novels.search({ word: 'fantasy' })
   * if (page.isOk) {
   *   console.log(page.value.novels.length)
   * }
   * ```
   */
  search(
    params: NovelSearchParams
  ): PaginatedResultAsync<NovelListPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<NovelListPage>(
        '/v1/search/novel',
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
      (page) => page.novels
    )
  }

  /**
   * Fetches the novel ranking.
   * GET /v1/novel/ranking
   *
   * @param params - Request parameters
   */
  ranking(
    params: NovelRankingParams = {}
  ): PaginatedResultAsync<NovelListPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<NovelListPage>(
        '/v1/novel/ranking',
        buildParams({
          mode: params.mode ?? 'day',
          filter: params.filter ?? 'for_ios',
          date: params.date,
          offset: params.offset,
        })
      ),
      this.#http,
      (page) => page.novels
    )
  }

  /**
   * Fetches recommended novels.
   * GET /v1/novel/recommended
   *
   * @param params - Request parameters
   */
  recommended(
    params: NovelRecommendedParams = {}
  ): PaginatedResultAsync<NovelRecommendedPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<NovelRecommendedPage>(
        '/v1/novel/recommended',
        buildParams({
          filter: params.filter ?? 'for_ios',
          includeRankingNovels: true,
          includePrivacyPolicy: true,
          offset: params.offset,
          maxBookmarkIdForRecommend: params.maxBookmarkIdForRecommend,
        })
      ),
      this.#http,
      (page) => page.novels
    )
  }

  /**
   * Fetches a novel series.
   * GET /v2/novel/series
   *
   * @param params - Request parameters
   */
  series(
    params: NovelSeriesParams
  ): PaginatedResultAsync<NovelSeriesPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<NovelSeriesPage>(
        '/v2/novel/series',
        buildParams({ seriesId: params.seriesId, lastOrder: params.lastOrder })
      ),
      this.#http,
      (page) => page.novels
    )
  }

  /**
   * Adds a novel bookmark.
   * POST /v2/novel/bookmark/add
   *
   * @param params - Request parameters
   */
  bookmarkAdd(
    params: NovelBookmarkAddParams
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParams({
      novelId: params.novelId,
      restrict: params.restrict ?? 'public',
      ...(params.tags ? { tags: params.tags } : {}),
    })
    return this.#http.post<Record<string, never>>(
      '/v2/novel/bookmark/add',
      body.toString()
    )
  }

  /**
   * Removes a novel bookmark.
   * POST /v1/novel/bookmark/delete
   *
   * @param params - Request parameters
   */
  bookmarkDelete(
    params: NovelBookmarkDeleteParams
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParams({ novelId: String(params.novelId) })
    return this.#http.post<Record<string, never>>(
      '/v1/novel/bookmark/delete',
      body.toString()
    )
  }
}
