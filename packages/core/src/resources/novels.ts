/**
 * NovelResource — methods for the novel API namespace.
 */
import type { HttpClient } from '../http'
import type { PixivError } from '../errors'
import { buildParameters } from '../parameters'
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
export interface NovelDetailParameters {
  /** ID of the novel to fetch. */
  novelId: number
}

/** Parameters for fetching the WebView HTML of a novel. */
export interface NovelTextParameters {
  /** ID of the novel whose WebView HTML to fetch. */
  novelId: number
}

/** Parameters for fetching related novels. */
export interface NovelRelatedParameters {
  /** ID of the novel for which to fetch related works. */
  novelId: number
}

/** Parameters for searching novels. */
export interface NovelSearchParameters {
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
export interface NovelRankingParameters {
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
export interface NovelRecommendedParameters {
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
export interface NovelSeriesParameters {
  /** ID of the novel series to fetch. */
  seriesId: number
  /** Order of the last novel already seen; used for cursor-based pagination. */
  lastOrder?: number
}

/** Parameters for adding a novel bookmark. */
export interface NovelBookmarkAddParameters {
  /** ID of the novel to bookmark. */
  novelId: number
  /** Bookmark visibility (default: `"public"`). */
  restrict?: (typeof BookmarkRestrict)[keyof typeof BookmarkRestrict]
  /** Tags to attach to the bookmark. */
  tags?: string[]
}

/** Parameters for removing a novel bookmark. */
export interface NovelBookmarkDeleteParameters {
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
   * @param parameters - Request parameters
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
    parameters: NovelDetailParameters
  ): ResultAsync<NovelDetailResponse, PixivError> {
    return this.#http.get<NovelDetailResponse>(
      '/v2/novel/detail',
      buildParameters({ novelId: parameters.novelId })
    )
  }

  /**
   * Fetches the WebView HTML for a novel.
   * GET /webview/v2/novel
   *
   * Returns the raw HTML page that the pixiv app renders in a WebView.
   * To extract the plain text, parse the returned HTML (e.g. strip tags).
   *
   * @param parameters - Request parameters
   */
  text(parameters: NovelTextParameters): ResultAsync<string, PixivError> {
    return this.#http.get<string>(
      '/webview/v2/novel',
      // The webview endpoint uses the query parameter 'id', not 'novel_id'
      buildParameters({ id: parameters.novelId })
    )
  }

  /**
   * Fetches related novels for a given novel.
   * GET /v1/novel/related
   *
   * @param parameters - Request parameters
   */
  related(
    parameters: NovelRelatedParameters
  ): PaginatedResultAsync<NovelListPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<NovelListPage>(
        '/v1/novel/related',
        buildParameters({ novelId: parameters.novelId })
      ),
      this.#http,
      (page) => page.novels
    )
  }

  /**
   * Searches for novels.
   * GET /v1/search/novel
   *
   * @param parameters - Request parameters
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
    parameters: NovelSearchParameters
  ): PaginatedResultAsync<NovelListPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<NovelListPage>(
        '/v1/search/novel',
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
      (page) => page.novels
    )
  }

  /**
   * Fetches the novel ranking.
   * GET /v1/novel/ranking
   *
   * @param parameters - Request parameters
   */
  ranking(
    parameters: NovelRankingParameters = {}
  ): PaginatedResultAsync<NovelListPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<NovelListPage>(
        '/v1/novel/ranking',
        buildParameters({
          mode: parameters.mode ?? 'day',
          filter: parameters.filter ?? 'for_ios',
          date: parameters.date,
          offset: parameters.offset,
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
   * @param parameters - Request parameters
   */
  recommended(
    parameters: NovelRecommendedParameters = {}
  ): PaginatedResultAsync<NovelRecommendedPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<NovelRecommendedPage>(
        '/v1/novel/recommended',
        buildParameters({
          filter: parameters.filter ?? 'for_ios',
          includeRankingNovels: true,
          includePrivacyPolicy: true,
          offset: parameters.offset,
          maxBookmarkIdForRecommend: parameters.maxBookmarkIdForRecommend,
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
   * @param parameters - Request parameters
   */
  series(
    parameters: NovelSeriesParameters
  ): PaginatedResultAsync<NovelSeriesPage, PixivNovelItem> {
    return PaginatedResultAsync.fromResultAsync(
      this.#http.get<NovelSeriesPage>(
        '/v2/novel/series',
        buildParameters({
          seriesId: parameters.seriesId,
          lastOrder: parameters.lastOrder,
        })
      ),
      this.#http,
      (page) => page.novels
    )
  }

  /**
   * Adds a novel bookmark.
   * POST /v2/novel/bookmark/add
   *
   * @param parameters - Request parameters
   */
  bookmarkAdd(
    parameters: NovelBookmarkAddParameters
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParameters({
      novelId: parameters.novelId,
      restrict: parameters.restrict ?? 'public',
      ...(parameters.tags && { tags: parameters.tags }),
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
   * @param parameters - Request parameters
   */
  bookmarkDelete(
    parameters: NovelBookmarkDeleteParameters
  ): ResultAsync<Record<string, never>, PixivError> {
    const body = buildParameters({ novelId: String(parameters.novelId) })
    return this.#http.post<Record<string, never>>(
      '/v1/novel/bookmark/delete',
      body.toString()
    )
  }
}
