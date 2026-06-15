/**
 * NovelResource — methods for the novel API namespace.
 */
import type { HttpClient } from '../http.js'
import type { PixivError } from '../errors.js'
import { buildParams } from '../params.js'
import { PaginatedResultAsync } from '../paginated.js'
import type { ResultAsync } from '../result.js'
import type {
  BookmarkRestrict,
  NovelRankingMode,
  OSFilter,
  SearchDuration,
  SearchSort,
  SearchTarget,
} from '../options.js'
import type {
  NovelDetailResponse,
  NovelListPage,
  NovelRecommendedPage,
  NovelSeriesPage,
  PixivNovelItem,
} from '../types.js'

// === Request param types ===

/** Parameters for fetching a single novel by ID. */
export interface NovelDetailParams {
  novelId: number
}

/** Parameters for fetching novel text content. */
export interface NovelTextParams {
  id: number
}

/** Parameters for fetching related novels. */
export interface NovelRelatedParams {
  novelId: number
}

/** Parameters for searching novels. */
export interface NovelSearchParams {
  word: string
  searchTarget?: SearchTarget
  sort?: SearchSort
  filter?: OSFilter
  duration?: SearchDuration
  startDate?: string
  endDate?: string
  searchAiType?: 0 | 1
  offset?: number
}

/** Parameters for fetching the novel ranking. */
export interface NovelRankingParams {
  mode?: NovelRankingMode
  filter?: OSFilter
  date?: string
  offset?: number
}

/** Parameters for fetching recommended novels. */
export interface NovelRecommendedParams {
  filter?: OSFilter
  offset?: number
}

/** Parameters for fetching a novel series. */
export interface NovelSeriesParams {
  seriesId: number
  lastOrder?: number
}

/** Parameters for adding a novel bookmark. */
export interface NovelBookmarkAddParams {
  novelId: number
  restrict?: BookmarkRestrict
  tags?: string[]
}

/** Parameters for removing a novel bookmark. */
export interface NovelBookmarkDeleteParams {
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
   * Fetches the full text of a novel.
   * GET /webview/v2/novel
   *
   * @param params - Request parameters
   */
  text(params: NovelTextParams): ResultAsync<string, PixivError> {
    return this.#http.get<string>(
      '/webview/v2/novel',
      buildParams({ id: params.id })
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
