import crypto from 'node:crypto'
import qs from 'qs'
import {
  IllustContentType,
  IllustDetailOptions,
  SearchIllustOptions,
  RecommendedIllustOptions,
  RecommendedIllustNologinOptions,
  IllustBookmarkAddOptions,
  NovelDetailOptions,
  SearchNovelOptions,
  RecommendedNovelOptions,
  NovelSeriesOptions,
  UserDetailOptions,
  IllustSeriesOptions,
  NovelTextOptions,
  OSFilter,
  SearchSort,
  SearchTarget,
  BookmarkRestrict,
  MangaRecommendedOptions,
  IllustBookmarkDeleteOptions,
  NovelBookmarkAddOptions,
  NovelBookmarkDeleteOptions,
  UserBookmarksIllustOptions,
  UserBookmarksNovelOptions,
  UgoiraDetailOptions,
  IllustRelatedOptions,
  NovelRelatedOptions,
  IllustRankingOptions,
  RankingMode,
  NovelRankingOptions,
  FollowRestrict,
  UserFollowingOptions,
  UserFollowAddOptions,
  UserFollowDeleteOptions,
} from './options'
import {
  PixivApiResponse,
  PixivHttpClient,
  PixivRateLimitRetryOptions,
} from './http-client'
import { PixivApiError } from './types/error-response'
import {
  GetV1IllustDetailRequest,
  GetV1IllustDetailResponse,
} from './types/endpoints/v1/illust/detail'
import {
  GetV1SearchIllustRequest,
  GetV1SearchIllustResponse,
} from './types/endpoints/v1/search/illust'
import {
  GetV1IllustRecommendedNologinRequest,
  GetV1IllustRecommendedRequest,
  GetV1IllustRecommendedResponse,
} from './types/endpoints/v1/illust/recommended'
import {
  PostV2IllustBookmarkAddRequest,
  PostV2IllustBookmarkAddResponse,
} from './types/endpoints/v2/illust/bookmark/add'
import {
  GetV1IllustSeriesRequest,
  GetV1IllustSeriesResponse,
} from './types/endpoints/v1/illust/series'
import {
  GetV2NovelDetailRequest,
  GetV2NovelDetailResponse,
} from './types/endpoints/v2/novel/detail'
import {
  GetV1SearchNovelRequest,
  GetV1SearchNovelResponse,
} from './types/endpoints/v1/search/novel'
import {
  GetV1NovelRecommendedRequest,
  GetV1NovelRecommendedResponse,
} from './types/endpoints/v1/novel/recommended'
import {
  GetV2NovelSeriesRequest,
  GetV2NovelSeriesResponse,
} from './types/endpoints/v2/novel/series'
import {
  GetV1UserDetailRequest,
  GetV1UserDetailResponse,
} from './types/endpoints/v1/user/detail'
import {
  GetV1MangaRecommendedRequest,
  GetV1MangaRecommendedResponse,
} from './types/endpoints/v1/manga/recommended'
import {
  PostV1IllustBookmarkDeleteRequest,
  PostV1IllustBookmarkDeleteResponse,
} from './types/endpoints/v1/illust/bookmark/delete'
import {
  PostV2NovelBookmarkAddRequest,
  PostV2NovelBookmarkAddResponse,
} from './types/endpoints/v2/novel/bookmark/add'
import {
  PostV1NovelBookmarkDeleteRequest,
  PostV1NovelBookmarkDeleteResponse,
} from './types/endpoints/v1/novel/bookmark/delete'
import {
  GetV1UserBookmarksNovelRequest,
  GetV1UserBookmarksNovelResponse,
} from './types/endpoints/v1/user/bookmarks/novel'
import {
  GetV1UserBookmarksIllustRequest,
  GetV1UserBookmarksIllustResponse,
} from './types/endpoints/v1/user/bookmarks/illust'
import {
  GetV1IllustUgoiraMetadataRequest,
  GetV1IllustUgoiraMetadataResponse,
} from './types/endpoints/v1/illust/ugoira/metadata'
import { ResponseDatabase, ResponseDatabaseOptions } from './saving-responses'
import {
  GetV2IllustRelatedRequest,
  GetV2IllustRelatedResponse,
} from './types/endpoints/v2/illust/related'
import {
  GetV1NovelRelatedRequest,
  GetV1NovelRelatedResponse,
} from './types/endpoints/v1/novel/related'
import {
  GetV1IllustRankingRequest,
  GetV1IllustRankingResponse,
} from './types/endpoints/v1/illust/ranking'
import {
  GetV1NovelRankingRequest,
  GetV1NovelRankingResponse,
} from './types/endpoints/v1/novel/ranking'
import {
  GetWebViewV2NovelRequest,
  GetWebViewV2NovelResponse,
} from './types/endpoints/webview/v2/novel'
import {
  GetV1UserFollowingRequest,
  GetV1UserFollowingResponse,
} from './types/endpoints/v1/user/following'
import {
  PostV1UserFollowAddRequest,
  PostV1UserFollowAddResponse,
} from './types/endpoints/v1/user/follow/add'
import {
  PostV1UserFollowDeleteRequest,
  PostV1UserFollowDeleteResponse,
} from './types/endpoints/v1/user/follow/delete'

interface GetRequestOptions<T> {
  method: 'GET'
  path: string
  params?: T
}

interface PostRequestOptions<T> {
  method: 'POST'
  path: string
  data?: T
}

type RequestOptions<T> = GetRequestOptions<T> | PostRequestOptions<T>

export interface PixivDebugOutputResponseOptions {
  enable: boolean

  db?: ResponseDatabaseOptions
}

export interface PixivDebugOptions {
  outputResponse?: PixivDebugOutputResponseOptions
}

export interface PixivTsOptions {
  debugOptions?: PixivDebugOptions
  rateLimitRetryOptions?: PixivRateLimitRetryOptions
}

/**
 * pixiv API
 */
export default class Pixiv {
  private static clientId = 'MOBrBDS8blbauoSck0ZfDbtuzpyT'
  private static clientSecret = 'lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj'
  private static hashSecret =
    '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c'

  private hosts = 'https://app-api.pixiv.net'

  readonly userId: string
  readonly accessToken: string
  readonly refreshToken: string
  readonly responseDatabase: ResponseDatabase | null
  readonly rateLimitRetryOptions: PixivRateLimitRetryOptions | null
  readonly http: PixivHttpClient

  /**
   * Constructor. Cannot be instantiated externally; use the `of` method instead.
   *
   * @param userId User ID
   * @param accessToken Access token
   * @param refreshToken Refresh token
   * @param responseDatabase Database for saving responses (null if not used)
   * @param rateLimitRetryOptions Retry settings for 429 errors
   */
  private constructor(
    userId: string,
    accessToken: string,
    refreshToken: string,
    responseDatabase?: ResponseDatabase | null,
    rateLimitRetryOptions?: PixivRateLimitRetryOptions
  ) {
    this.userId = userId
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.responseDatabase = responseDatabase ?? null
    this.rateLimitRetryOptions = rateLimitRetryOptions ?? null

    this.http = new PixivHttpClient(
      this.hosts,
      {
        Host: 'app-api.pixiv.net',
        'App-OS': 'ios',
        'App-OS-Version': '14.6',
        'User-Agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
        'Accept-Language': 'ja',
        Authorization: `Bearer ${this.accessToken}`,
      },
      this.rateLimitRetryOptions
    )
  }

  /**
   * Creates an instance from a refresh token.
   *
   * @param refreshToken Refresh token
   * @returns Pixiv instance
   */
  public static async of(
    refreshToken: string,
    pixivTsOptions?: PixivTsOptions
  ) {
    // @see https://github.com/upbit/pixivpy/blob/master/pixivpy3/api.py#L120

    // Get the current time in UTC, formatted as YYYY-MM-DDTHH:mm:ss+00:00
    const localTime = new Date().toISOString().replace(/Z$/, '+00:00')

    const headers = {
      'x-client-time': localTime,
      'x-client-hash': this.hash(localTime),
      'app-os': 'ios',
      'app-os-version': '16.4.1',
      'user-agent': ' PixivIOSApp/7.16.9 (iOS 16.4.1; iPad13,4)',
      header: 'application/x-www-form-urlencoded',
    }

    const authUrl = 'https://oauth.secure.pixiv.net/auth/token'

    const data = qs.stringify({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      get_secure_url: 1,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data,
    })

    if (response.status !== 200) {
      throw new Error('Failed to refresh token')
    }

    const responseData = (await response.json()) as {
      user: { id: string }
      response: { access_token: string; refresh_token: string }
    }

    const options = {
      userId: responseData.user.id,
      accessToken: responseData.response.access_token,
      refreshToken: responseData.response.refresh_token,
    }

    const responseDatabase = pixivTsOptions?.debugOptions?.outputResponse
      ?.enable
      ? new ResponseDatabase(pixivTsOptions.debugOptions.outputResponse.db)
      : null
    if (responseDatabase) {
      await responseDatabase.init()
      await responseDatabase.migrate()
      await responseDatabase.sync()
    }

    return new Pixiv(
      options.userId,
      options.accessToken,
      options.refreshToken,
      responseDatabase,
      pixivTsOptions?.rateLimitRetryOptions
    )
  }

  /**
   * Returns a `Response` for fetching an image.
   *
   * The return value is a `Response` object, not the stream itself;
   * to read it as a stream, refer to `response.body`.
   * Other `Response` APIs such as `arrayBuffer()` can also be used as needed.
   *
   * @param url Image URL
   * @returns The `Response` from fetching the image
   */
  public static async getImageStream(url: string): Promise<Response> {
    return fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        Referer: 'https://www.pixiv.net/',
      },
    })
  }

  // ---------- Illust ---------- //

  /**
   * Gets the details of an illust.
   *
   * @param options Options
   * @returns Response
   */
  public async illustDetail(options: IllustDetailOptions) {
    type RequestType = GetV1IllustDetailRequest
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      illust_id: options.illustId,
    }

    return this.request<RequestType, GetV1IllustDetailResponse>({
      method: 'GET',
      path: '/v1/illust/detail',
      params: parameters,
    })
  }

  /**
   * Gets illusts related to an illust.
   *
   * @param options Options
   * @returns Response
   */
  public async illustRelated(options: IllustRelatedOptions) {
    type RequestType = GetV2IllustRelatedRequest
    this.checkRequiredOptions(options, ['illustId'])
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      illust_id: options.illustId,
      filter: options.filter ?? OSFilter.FOR_IOS,
      seed_illust_ids: options.seedIllustIds,
      viewed: options.viewed,
      offset: options.offset,
    }

    return this.request<RequestType, GetV2IllustRelatedResponse>({
      method: 'GET',
      path: '/v2/illust/related',
      params: parameters,
    })
  }

  /**
   * Searches for illusts.
   *
   * @param options Options
   * @returns Response
   */
  public async searchIllust(options: SearchIllustOptions) {
    this.checkRequiredOptions(options, ['word'])
    type RequestType = GetV1SearchIllustRequest
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      word: options.word, // required
      search_target:
        options.searchTarget ?? SearchTarget.PARTIAL_MATCH_FOR_TAGS,
      sort: options.sort ?? SearchSort.DATE_DESC,
      start_date: options.startDate,
      end_date: options.endDate,
      filter: options.filter ?? OSFilter.FOR_IOS,
      offset: options.offset,
      merge_plain_keyword_results: options.mergePlainKeywordResults ?? true,
      include_translated_tag_results:
        options.includeTranslatedTagResults ?? true,
      duration: options.duration,
      search_ai_type: options.searchAiType,
    }

    return this.request<RequestType, GetV1SearchIllustResponse>({
      method: 'GET',
      path: '/v1/search/illust',
      params: parameters,
    })
  }

  /**
   * Gets the illust ranking.
   *
   * @param options Options
   * @returns Response
   */
  public async illustRanking(options: IllustRankingOptions = {}) {
    type RequestType = GetV1IllustRankingRequest
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      mode: options.mode ?? RankingMode.DAY,
      filter: options.filter ?? OSFilter.FOR_IOS,
      date: options.date ?? undefined,
      offset: options.offset ?? undefined,
    }

    return this.request<RequestType, GetV1IllustRankingResponse>({
      method: 'GET',
      path: '/v1/illust/ranking',
      params: parameters,
    })
  }

  /**
   * Gets recommended illusts.
   *
   * @param options Options
   * @returns Response
   */
  public async illustRecommended(options: RecommendedIllustOptions = {}) {
    type RequestType = GetV1IllustRecommendedRequest
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      content_type: options.contentType ?? IllustContentType.ILLUST,
      include_ranking_label: options.includeRankingLabel ?? true,
      filter: options.filter ?? OSFilter.FOR_IOS,
      include_ranking_illusts: options.includeRankingIllusts ?? true,
      min_bookmark_id_for_recent_illust:
        options.minBookmarkIdForRecentIllust ?? undefined,
      max_bookmark_id_for_recommend:
        options.maxBookmarkIdForRecommend ?? undefined,
      offset: options.offset ?? undefined,
      include_privacy_policy: options.includePrivacyPolicy ?? true,
      viewed: options.viewed,
    }

    return this.request<RequestType, GetV1IllustRecommendedResponse>({
      method: 'GET',
      path: '/v1/illust/recommended',
      params: parameters,
    })
  }

  /**
   * Gets recommended illusts without authentication.
   *
   * Uses the unauthenticated endpoint /v1/illust/recommended-nologin.
   * This is a static method that does not require a Pixiv instance.
   *
   * @param options Options
   * @returns Response
   */
  public static async illustRecommendedNologin(
    options: RecommendedIllustNologinOptions = {}
  ): Promise<PixivApiResponse<GetV1IllustRecommendedResponse>> {
    const hosts = 'https://app-api.pixiv.net'
    const http = new PixivHttpClient(hosts, {
      Host: 'app-api.pixiv.net',
      'App-OS': 'ios',
      'App-OS-Version': '14.6',
      'User-Agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
      'Accept-Language': 'ja',
    })

    type RequestType = GetV1IllustRecommendedNologinRequest
    const parameters: RequestType = {
      content_type: options.contentType ?? IllustContentType.ILLUST,
      include_ranking_label: options.includeRankingLabel,
      filter: options.filter ?? OSFilter.FOR_IOS,
      max_bookmark_id_for_recommend: options.maxBookmarkIdForRecommend,
      min_bookmark_id_for_recent_illust: options.minBookmarkIdForRecentIllust,
      offset: options.offset,
      include_ranking_illusts: options.includeRankingIllusts,
      bookmark_illust_ids:
        options.bookmarkIllustIds && options.bookmarkIllustIds.length > 0
          ? options.bookmarkIllustIds.join(',')
          : undefined,
      include_privacy_policy: options.includePrivacyPolicy,
    }

    return http.get<GetV1IllustRecommendedResponse>(
      '/v1/illust/recommended-nologin',
      { params: parameters }
    )
  }

  /**
   * Gets the details of an illust series.
   *
   * @param options Options
   * @returns Response
   */
  public async illustSeries(options: IllustSeriesOptions) {
    type RequestType = GetV1IllustSeriesRequest
    this.checkRequiredOptions(options, ['illustSeriesId'])
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      illust_series_id: options.illustSeriesId,
      filter: options.filter ?? OSFilter.FOR_IOS,
      // offset: options.offset,
    }

    return this.request<RequestType, GetV1IllustSeriesResponse>({
      method: 'GET',
      path: '/v1/illust/series',
      params: parameters,
    })
  }

  /**
   * Bookmarks an illust.
   *
   * @param options Options
   * @returns Response
   */
  public async illustBookmarkAdd(options: IllustBookmarkAddOptions) {
    type RequestType = PostV2IllustBookmarkAddRequest
    this.checkRequiredOptions(options, ['illustId'])
    const data: RequestType = {
      ...this.convertCamelToSnake(options),
      illust_id: options.illustId,
      restrict: options.restrict ?? BookmarkRestrict.PUBLIC,
      tags: options.tags ?? [],
    }

    return this.request<RequestType, PostV2IllustBookmarkAddResponse>({
      method: 'POST',
      path: '/v2/illust/bookmark/add',
      data,
    })
  }

  /**
   * Removes an illust bookmark.
   *
   * @param options Options
   * @returns Response
   */
  public async illustBookmarkDelete(options: IllustBookmarkDeleteOptions) {
    type RequestType = PostV1IllustBookmarkDeleteRequest
    this.checkRequiredOptions(options, ['illustId'])
    const data: RequestType = {
      ...this.convertCamelToSnake(options),
      illust_id: options.illustId,
    }

    return this.request<RequestType, PostV1IllustBookmarkDeleteResponse>({
      method: 'POST',
      path: '/v1/illust/bookmark/delete',
      data,
    })
  }

  // ---------- Manga ---------- //

  public async mangaRecommended(options: MangaRecommendedOptions = {}) {
    type RequestType = GetV1MangaRecommendedRequest
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      filter: options.filter ?? OSFilter.FOR_IOS,
      include_ranking_illusts: options.includeRankingIllusts ?? true,
      max_bookmark_id: options.maxBookmarkId ?? undefined,
      offset: options.offset ?? undefined,
      include_privacy_policy: options.includePrivacyPolicy ?? true,
    }

    return this.request<RequestType, GetV1MangaRecommendedResponse>({
      method: 'GET',
      path: '/v1/manga/recommended',
      params: parameters,
    })
  }

  // ---------- Ugoira ---------- //

  /**
   * Gets the details of an ugoira.
   *
   * @param options Options
   * @returns Response
   */
  public async ugoiraMetadata(options: UgoiraDetailOptions) {
    type RequestType = GetV1IllustUgoiraMetadataRequest
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      illust_id: options.illustId,
    }

    return this.request<RequestType, GetV1IllustUgoiraMetadataResponse>({
      method: 'GET',
      path: '/v1/ugoira/metadata',
      params: parameters,
    })
  }

  // ---------- Novel ---------- //

  /**
   * Gets the details of a novel.
   *
   * @param options Options
   * @returns Response
   */
  public async novelDetail(options: NovelDetailOptions) {
    type RequestType = GetV2NovelDetailRequest
    this.checkRequiredOptions(options, ['novelId'])
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      novel_id: options.novelId,
    }

    return this.request<RequestType, GetV2NovelDetailResponse>({
      method: 'GET',
      path: '/v2/novel/detail',
      params: parameters,
    })
  }

  /**
   * Gets the text of a novel.
   *
   * @param options Options
   * @returns Response
   */
  public async novelText(options: NovelTextOptions) {
    type RequestType = GetWebViewV2NovelRequest
    this.checkRequiredOptions(options, ['id'])
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      id: options.id,
    }

    return await this.request<RequestType, GetWebViewV2NovelResponse>({
      method: 'GET',
      path: '/webview/v2/novel',
      params: parameters,
    })
  }

  /**
   * Gets novels related to a novel.
   *
   * @param options Options
   * @returns Response
   */
  public async novelRelated(options: NovelRelatedOptions) {
    type RequestType = GetV1NovelRelatedRequest
    this.checkRequiredOptions(options, ['novelId'])

    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      novel_id: options.novelId,
      seed_novel_ids: options.seedNovelIds,
      viewed: options.viewed,
    }

    return this.request<RequestType, GetV1NovelRelatedResponse>({
      method: 'GET',
      path: '/v1/novel/related',
      params: parameters,
    })
  }

  /**
   * Searches for novels.
   *
   * @param options Options
   * @returns Response
   */
  public async searchNovel(options: SearchNovelOptions) {
    type RequestType = GetV1SearchNovelRequest
    this.checkRequiredOptions(options, ['word'])
    const parameters = {
      ...this.convertCamelToSnake(options),
      word: options.word, // required
      search_target:
        options.searchTarget ?? SearchTarget.PARTIAL_MATCH_FOR_TAGS,
      sort: options.sort ?? SearchSort.DATE_DESC,
      start_date: options.startDate,
      end_date: options.endDate,
      filter: options.filter ?? OSFilter.FOR_IOS,
      offset: options.offset,
      merge_plain_keyword_results: options.mergePlainKeywordResults ?? true,
      include_translated_tag_results:
        options.includeTranslatedTagResults ?? true,
      search_ai_type: options.searchAiType,
    }

    return this.request<RequestType, GetV1SearchNovelResponse>({
      method: 'GET',
      path: '/v1/search/novel',
      params: parameters,
    })
  }

  /**
   * Gets the novel ranking.
   */
  public async novelRanking(options: NovelRankingOptions = {}) {
    type RequestType = GetV1NovelRankingRequest
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      mode: options.mode ?? RankingMode.DAY,
      date: options.date ?? undefined,
      offset: options.offset ?? undefined,
    }

    return this.request<RequestType, GetV1NovelRankingResponse>({
      method: 'GET',
      path: '/v1/novel/ranking',
      params: parameters,
    })
  }

  /**
   * Gets recommended novels.
   *
   * @param options Options
   * @returns Response
   */
  public async novelRecommended(options: RecommendedNovelOptions = {}) {
    type RequestType = GetV1NovelRecommendedRequest
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      // filter: options.filter ?? 'for_ios',
      include_ranking_novels: options.includeRankingNovels ?? true,
      already_recommended: options.alreadyRecommended
        ? options.alreadyRecommended.join(',')
        : undefined,
      max_bookmark_id_for_recommend:
        options.maxBookmarkIdForRecommend ?? undefined,
      offset: options.offset ?? undefined,
      include_privacy_policy: options.includePrivacyPolicy ?? true,
    }

    return this.request<RequestType, GetV1NovelRecommendedResponse>({
      method: 'GET',
      path: '/v1/novel/recommended',
      params: parameters,
    })
  }

  /**
   * Gets the details of a novel series.
   *
   * @param options Options
   * @returns Response
   */
  public async novelSeries(options: NovelSeriesOptions) {
    type RequestType = GetV2NovelSeriesRequest
    this.checkRequiredOptions(options, ['seriesId'])
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      series_id: options.seriesId,
      // filter: options.filter ?? 'for_ios',
      last_order: options.lastOrder ?? undefined,
    }

    return this.request<RequestType, GetV2NovelSeriesResponse>({
      method: 'GET',
      path: '/v2/novel/series',
      params: parameters,
    })
  }

  /**
   * Bookmarks a novel.
   *
   * @param options Options
   * @returns Response
   */
  public async novelBookmarkAdd(options: NovelBookmarkAddOptions) {
    type RequestType = PostV2NovelBookmarkAddRequest
    this.checkRequiredOptions(options, ['novelId'])
    const data: RequestType = {
      ...this.convertCamelToSnake(options),
      novel_id: options.novelId,
      restrict: options.restrict ?? BookmarkRestrict.PUBLIC,
      tags: options.tags ?? [],
    }

    return this.request<RequestType, PostV2NovelBookmarkAddResponse>({
      method: 'POST',
      path: '/v2/novel/bookmark/add',
      data,
    })
  }

  /**
   * Removes a novel bookmark.
   *
   * @param options Options
   * @returns Response
   */
  public async novelBookmarkDelete(options: NovelBookmarkDeleteOptions) {
    type RequestType = PostV1NovelBookmarkDeleteRequest
    this.checkRequiredOptions(options, ['novelId'])
    const data: RequestType = {
      ...this.convertCamelToSnake(options),
      novel_id: options.novelId,
    }

    return this.request<RequestType, PostV1NovelBookmarkDeleteResponse>({
      method: 'POST',
      path: '/v1/novel/bookmark/delete',
      data,
    })
  }

  // ---------- User ---------- //

  /**
   * Gets the details of a user.
   *
   * @param options Options
   * @returns Response
   */
  public async userDetail(options: UserDetailOptions) {
    type RequestType = GetV1UserDetailRequest
    this.checkRequiredOptions(options, ['userId'])
    const parameters = {
      ...this.convertCamelToSnake(options),
      user_id: options.userId,
      filter: options.filter ?? OSFilter.FOR_IOS,
    }

    return this.request<RequestType, GetV1UserDetailResponse>({
      method: 'GET',
      path: '/v1/user/detail',
      params: parameters,
    })
  }

  /**
   * Gets a user's illust bookmarks.
   *
   * @param options Options
   * @returns Response
   */
  public async userBookmarksIllust(options: UserBookmarksIllustOptions) {
    type RequestType = GetV1UserBookmarksIllustRequest
    this.checkRequiredOptions(options, ['userId'])
    const parameters = {
      ...this.convertCamelToSnake(options),
      user_id: options.userId,
      restrict: options.restrict ?? BookmarkRestrict.PUBLIC,
      filter: options.filter ?? OSFilter.FOR_IOS,
      max_bookmark_id: options.maxBookmarkId ?? undefined,
      tag: options.tag ?? undefined,
    }

    return this.request<RequestType, GetV1UserBookmarksIllustResponse>({
      method: 'GET',
      path: '/v1/user/bookmarks/illust',
      params: parameters,
    })
  }

  /**
   * Gets a user's novel bookmarks.
   *
   * @param options Options
   * @returns Response
   */
  public async userBookmarksNovel(options: UserBookmarksNovelOptions) {
    type RequestType = GetV1UserBookmarksNovelRequest
    this.checkRequiredOptions(options, ['userId'])
    const parameters = {
      ...this.convertCamelToSnake(options),
      user_id: options.userId,
      restrict: options.restrict ?? BookmarkRestrict.PUBLIC,
      max_bookmark_id: options.maxBookmarkId ?? undefined,
      tag: options.tag ?? undefined,
    }

    return this.request<RequestType, GetV1UserBookmarksNovelResponse>({
      method: 'GET',
      path: '/v1/user/bookmarks/novel',
      params: parameters,
    })
  }

  /**
   * Gets the list of users a user is following.
   *
   * @param options Options
   * @returns Response
   */
  public async userFollowing(options: UserFollowingOptions) {
    type RequestType = GetV1UserFollowingRequest
    this.checkRequiredOptions(options, ['userId'])
    const parameters: RequestType = {
      ...this.convertCamelToSnake(options),
      user_id: options.userId,
      restrict: options.restrict ?? FollowRestrict.PUBLIC,
      offset: options.offset ?? undefined,
    }

    return this.request<RequestType, GetV1UserFollowingResponse>({
      method: 'GET',
      path: '/v1/user/following',
      params: parameters,
    })
  }

  /**
   * Follows a user.
   *
   * @param options Options
   * @returns Response
   */
  public async userFollowAdd(options: UserFollowAddOptions) {
    type RequestType = PostV1UserFollowAddRequest
    this.checkRequiredOptions(options, ['userId'])
    const data: RequestType = {
      ...this.convertCamelToSnake(options),
      user_id: options.userId,
      restrict: options.restrict ?? FollowRestrict.PUBLIC,
    }

    return this.request<RequestType, PostV1UserFollowAddResponse>({
      method: 'POST',
      path: '/v1/user/follow/add',
      data,
    })
  }

  /**
   * Unfollows a user.
   *
   * @param options Options
   * @returns Response
   */
  public async userFollowDelete(options: UserFollowDeleteOptions) {
    type RequestType = PostV1UserFollowDeleteRequest
    this.checkRequiredOptions(options, ['userId'])
    const data: RequestType = {
      ...this.convertCamelToSnake(options),
      user_id: options.userId,
    }

    return this.request<RequestType, PostV1UserFollowDeleteResponse>({
      method: 'POST',
      path: '/v1/user/follow/delete',
      data,
    })
  }

  // ---------- Others ---------- //

  /**
   * Closes the connection.
   */
  public async close() {
    if (this.responseDatabase) {
      await this.responseDatabase.close()
    }
  }

  // ---------- Utilities ---------- //

  /**
   * Parses a query string.
   *
   * @param url URL
   * @returns The parsed query string object
   */
  public static parseQueryString(url: string) {
    let query = url
    if (url.includes('?')) {
      query = url.split('?', 2)[1]
    }

    return qs.parse(query)
  }

  /**
   * Determines whether the response is an error.
   *
   * @param response Axios response
   * @returns Whether it is an error
   */
  public static isError(response: any): response is PixivApiError {
    return (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.error !== undefined &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.error.user_message !== undefined &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.error.message !== undefined &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.error.reason !== undefined
    )
  }

  /**
   * Generates an MD5 hash.
   *
   * @param str String
   * @returns Hash
   */
  private static hash(string: string) {
    const hash = crypto.createHash('md5')
    return hash.update(string + this.hashSecret).digest('hex')
  }

  /**
   * Sends a request.
   *
   * The order of generics is T: request, U: response.
   *
   * @param options Options
   * @returns Response
   */
  private async request<T, U extends string | object>(
    options: RequestOptions<T>
  ): Promise<PixivApiResponse<U>> {
    if (options.method === 'GET') {
      return await this.saveResponse(
        options,
        await this.http.get<U>(options.path, {
          params: options.params as Record<string, any> | undefined,
        })
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (options.method === 'POST') {
      return await this.saveResponse(
        options,
        await this.http.post<U>(options.path, qs.stringify(options.data), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      )
    }
    throw new Error('Invalid method')
  }

  private async saveResponse<T extends string | object>(
    request: RequestOptions<any>,
    response: PixivApiResponse<T>
  ): Promise<PixivApiResponse<T>> {
    if (this.responseDatabase === null) {
      return response
    }
    const method = request.method
    const path = request.path
    const rawUrl = [
      this.hosts,
      path,
      method === 'GET'
        ? qs.stringify(request.params, { addQueryPrefix: true })
        : '',
    ].join('')
    const url = response.responseUrl ?? rawUrl

    const responseType = this.isJSON(response.data) ? 'JSON' : 'TEXT'
    const responseBody =
      responseType === 'JSON'
        ? JSON.stringify(response.data)
        : (response.data as string)

    await this.responseDatabase.addResponse({
      method,
      endpoint: path,
      url,
      requestHeaders: JSON.stringify(response.requestHeaders),
      requestBody: response.requestBody,
      responseType,
      statusCode: response.status,
      responseHeaders: JSON.stringify(response.headers),
      responseBody,
    })

    return response
  }

  private isJSON(value: string | object) {
    if (typeof value === 'object') {
      return true
    }
    try {
      JSON.parse(value)
      return true
    } catch {
      return false
    }
  }

  /**
   * Checks whether the required options are included.
   *
   * @param options Options
   * @param required Required option keys
   * @throws If a required option is missing
   */
  private checkRequiredOptions(
    options: Record<string, any>,
    required: string[]
  ) {
    for (const key of required) {
      if (options[key] === undefined) {
        throw new Error(`Missing required option: ${key}`)
      }
    }
  }

  /**
   * Converts camelCase object keys to snake_case object keys.
   *
   * @param object Object
   * @returns The converted object
   */
  private convertCamelToSnake(object: Record<string, any>) {
    const result: Record<string, any> = {}
    for (const key of Object.keys(object)) {
      const snakeKey = key.replaceAll(
        /([A-Z])/g,
        (m) => `_${m[0].toLowerCase()}`
      )
      result[snakeKey] = object[key]
    }
    return result
  }
}
