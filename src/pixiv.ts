import crypto from 'node:crypto'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ReadStream } from 'node:fs'
import qs from 'qs'
import {
  IllustDetailOptions,
  SearchIllustOptions,
  RecommendedIllustOptions,
  IllustBookmarkAddOptions,
  NovelDetailOptions,
  SearchNovelOptions,
  RecommendedNovelOptions,
  NovelSeriesOptions,
  UserDetailOptions,
  IllustSeriesOptions,
  NovelTextOptions,
  Filter,
  SearchSort,
  SearchTarget,
  BookmarkRestrict,
  MangaRecommendedOptions,
  IllustBookmarkDeleteOptions,
  NovelBookmarkAddOptions,
  NovelBookmarkDeleteOptions,
  UserBookmarksIllustOptions,
  UserBookmarksNovelOptions,
} from './options'
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
  GetV1NovelTextRequest,
  GetV1NovelTextResponse,
} from './types/endpoints/v1/novel/text'
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
  readonly axios: AxiosInstance

  /**
   * コンストラクタ。外部からインスタンス化できないので、of メソッドを使うこと。
   *
   * @param userId ユーザー ID
   * @param accessToken アクセストークン
   * @param refreshToken リフレッシュトークン
   */
  private constructor(
    userId: string,
    accessToken: string,
    refreshToken: string
  ) {
    this.userId = userId
    this.accessToken = accessToken
    this.refreshToken = refreshToken

    this.axios = axios.create({
      baseURL: this.hosts,
      headers: {
        Host: 'app-api.pixiv.net',
        'App-OS': 'ios',
        'App-OS-Version': '14.6',
        'User-Agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
        Authorization: `Bearer ${this.accessToken}`,
      },
      validateStatus: () => true,
    })
  }

  /**
   * リフレッシュトークンからインスタンスを生成する。
   *
   * @param refreshToken リフレッシュトークン
   * @returns Pixiv インスタンス
   */
  public static async of(refreshToken: string) {
    // @see https://github.com/upbit/pixivpy/blob/master/pixivpy3/api.py#L120

    // UTCで YYYY-MM-DDTHH:mm:ss+00:00 の形式で現在時刻を取得
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

    const response = await axios.post(authUrl, data, {
      headers,
      validateStatus: () => true,
    })

    if (response.status !== 200) {
      throw new Error('Failed to refresh token')
    }

    const options = {
      userId: response.data.user.id,
      accessToken: response.data.response.access_token,
      refreshToken: response.data.response.refresh_token,
    }

    return new Pixiv(options.userId, options.accessToken, options.refreshToken)
  }

  /**
   * 画像のaxiosストリームを取得する。
   */
  public static async getAxiosImageStream(url: string) {
    return axios.get<ReadStream>(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
        Referer: 'https://www.pixiv.net/',
      },
      responseType: 'stream',
    })
  }

  // ---------- イラスト ---------- //

  /**
   * イラストの詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async illustDetail(options: IllustDetailOptions) {
    type RequestType = GetV1IllustDetailRequest
    const parameters: RequestType = {
      ...this.convertSnakeToCamel(options),
      illust_id: options.illustId,
    }

    return this.request<RequestType, GetV1IllustDetailResponse>({
      method: 'GET',
      path: '/v1/illust/detail',
      params: parameters,
    })
  }

  /**
   * イラストを検索する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async searchIllust(options: SearchIllustOptions) {
    this.checkRequiredOptions(options, ['word'])
    type RequestType = GetV1SearchIllustRequest
    const parameters: RequestType = {
      ...this.convertSnakeToCamel(options),
      word: options.word, // required
      search_target:
        options.searchTarget || SearchTarget.PARTIAL_MATCH_FOR_TAGS,
      sort: options.sort || SearchSort.DATE_DESC,
      start_date: options.startDate,
      end_date: options.endDate,
      filter: options.filter || Filter.FOR_IOS,
      offset: options.offset,
      merge_plain_keyword_results: options.mergePlainKeywordResults || true,
      include_translated_tag_results:
        options.includeTranslatedTagResults || true,
    }

    return this.request<RequestType, GetV1SearchIllustResponse>({
      method: 'GET',
      path: '/v1/search/illust',
      params: parameters,
    })
  }

  /**
   * おすすめイラストを取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async illustRecommended(options: RecommendedIllustOptions = {}) {
    type RequestType = GetV1IllustRecommendedRequest
    const parameters: RequestType = {
      ...this.convertSnakeToCamel(options),
      filter: options.filter || Filter.FOR_IOS,
      include_ranking_illusts: options.includeRankingIllusts || true,
      min_bookmark_id_for_recent_illust:
        options.minBookmarkIdForRecentIllust || undefined,
      max_bookmark_id_for_recommend:
        options.maxBookmarkIdForRecommend || undefined,
      offset: options.offset || undefined,
      include_privacy_policy: options.includePrivacyPolicy || true,
    }

    return this.request<RequestType, GetV1IllustRecommendedResponse>({
      method: 'GET',
      path: '/v1/illust/recommended',
      params: parameters,
    })
  }

  /**
   * イラストシリーズの詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async illustSeries(options: IllustSeriesOptions) {
    type RequestType = GetV1IllustSeriesRequest
    this.checkRequiredOptions(options, ['illustSeriesId'])
    const parameters: RequestType = {
      ...this.convertSnakeToCamel(options),
      illust_series_id: options.illustSeriesId,
      filter: options.filter || Filter.FOR_IOS,
      // offset: options.offset,
    }

    return this.request<RequestType, GetV1IllustSeriesResponse>({
      method: 'GET',
      path: '/v1/illust/series',
      params: parameters,
    })
  }

  /**
   * イラストをブックマークする。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async illustBookmarkAdd(options: IllustBookmarkAddOptions) {
    type RequestType = PostV2IllustBookmarkAddRequest
    this.checkRequiredOptions(options, ['illustId'])
    const data: RequestType = {
      ...this.convertSnakeToCamel(options),
      illust_id: options.illustId,
      restrict: options.restrict || BookmarkRestrict.PUBLIC,
      tags: options.tags || [],
    }

    return this.request<RequestType, PostV2IllustBookmarkAddResponse>({
      method: 'POST',
      path: '/v2/illust/bookmark/add',
      data,
    })
  }

  /**
   * イラストのブックマークを削除する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async illustBookmarkDelete(options: IllustBookmarkDeleteOptions) {
    type RequestType = PostV1IllustBookmarkDeleteRequest
    this.checkRequiredOptions(options, ['illustId'])
    const data: RequestType = {
      ...this.convertSnakeToCamel(options),
      illust_id: options.illustId,
    }

    return this.request<RequestType, PostV1IllustBookmarkDeleteResponse>({
      method: 'POST',
      path: '/v1/illust/bookmark/delete',
      data,
    })
  }

  // ---------- マンガ ---------- //

  public async mangaRecommended(options: MangaRecommendedOptions = {}) {
    type RequestType = GetV1MangaRecommendedRequest
    const parameters: RequestType = {
      ...this.convertSnakeToCamel(options),
      filter: options.filter || Filter.FOR_IOS,
      include_ranking_illusts: options.includeRankingIllusts || true,
      max_bookmark_id: options.maxBookmarkId || undefined,
      offset: options.offset || undefined,
      include_privacy_policy: options.includePrivacyPolicy || true,
    }

    return this.request<RequestType, GetV1MangaRecommendedResponse>({
      method: 'GET',
      path: '/v1/manga/recommended',
      params: parameters,
    })
  }

  // ---------- 小説 ---------- //

  /**
   * 小説の詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async novelDetail(options: NovelDetailOptions) {
    type RequestType = GetV2NovelDetailRequest
    this.checkRequiredOptions(options, ['novelId'])
    const parameters: RequestType = {
      ...this.convertSnakeToCamel(options),
      novel_id: options.novelId,
    }

    return this.request<RequestType, GetV2NovelDetailResponse>({
      method: 'GET',
      path: '/v2/novel/detail',
      params: parameters,
    })
  }

  /**
   * 小説の本文を取得する。
   * (WIP: ページネーションに非対応)
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async novelText(options: NovelTextOptions) {
    type RequestType = GetV1NovelTextRequest
    this.checkRequiredOptions(options, ['novelId'])
    const parameters: RequestType = {
      ...this.convertSnakeToCamel(options),
      novel_id: options.novelId,
    }

    return this.request<RequestType, GetV1NovelTextResponse>({
      method: 'GET',
      path: '/v1/novel/text',
      params: parameters,
    })
  }

  /**
   * 小説を検索する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async searchNovel(options: SearchNovelOptions) {
    type RequestType = GetV1SearchNovelRequest
    this.checkRequiredOptions(options, ['word'])
    const parameters = {
      ...this.convertSnakeToCamel(options),
      word: options.word, // required
      search_target:
        options.searchTarget || SearchTarget.PARTIAL_MATCH_FOR_TAGS,
      sort: options.sort || SearchSort.DATE_DESC,
      startDate: options.startDate,
      endDate: options.endDate,
      filter: options.filter || Filter.FOR_IOS,
      offset: options.offset,
      merge_plain_keyword_results: options.mergePlainKeywordResults || true,
      include_translated_tag_results:
        options.includeTranslatedTagResults || true,
    }

    return this.request<RequestType, GetV1SearchNovelResponse>({
      method: 'GET',
      path: '/v1/search/novel',
      params: parameters,
    })
  }

  /**
   * おすすめ小説を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async novelRecommended(options: RecommendedNovelOptions = {}) {
    type RequestType = GetV1NovelRecommendedRequest
    const parameters: RequestType = {
      ...this.convertSnakeToCamel(options),
      // filter: options.filter || 'for_ios',
      include_ranking_novels: options.includeRankingNovels || true,
      already_recommended: options.alreadyRecommended
        ? options.alreadyRecommended.join(',')
        : undefined,
      max_bookmark_id_for_recommend:
        options.maxBookmarkIdForRecommend || undefined,
      offset: options.offset || undefined,
      include_privacy_policy: options.includePrivacyPolicy || true,
    }

    return this.request<RequestType, GetV1NovelRecommendedResponse>({
      method: 'GET',
      path: '/v1/novel/recommended',
      params: parameters,
    })
  }

  /**
   * 小説シリーズの詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async novelSeries(options: NovelSeriesOptions) {
    type RequestType = GetV2NovelSeriesRequest
    this.checkRequiredOptions(options, ['seriesId'])
    const parameters: RequestType = {
      ...this.convertSnakeToCamel(options),
      series_id: options.seriesId,
      // filter: options.filter || 'for_ios',
      last_order: options.lastOrder || undefined,
    }

    return this.request<RequestType, GetV2NovelSeriesResponse>({
      method: 'GET',
      path: '/v2/novel/series',
      params: parameters,
    })
  }

  /**
   * 小説をブックマークする。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async novelBookmarkAdd(options: NovelBookmarkAddOptions) {
    type RequestType = PostV2NovelBookmarkAddRequest
    this.checkRequiredOptions(options, ['novelId'])
    const data: RequestType = {
      ...this.convertSnakeToCamel(options),
      novel_id: options.novelId,
      restrict: options.restrict || BookmarkRestrict.PUBLIC,
      tags: options.tags || [],
    }

    return this.request<RequestType, PostV2NovelBookmarkAddResponse>({
      method: 'POST',
      path: '/v2/novel/bookmark/add',
      data,
    })
  }

  /**
   * 小説のブックマークを削除する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async novelBookmarkDelete(options: NovelBookmarkDeleteOptions) {
    type RequestType = PostV1NovelBookmarkDeleteRequest
    this.checkRequiredOptions(options, ['novelId'])
    const data: RequestType = {
      ...this.convertSnakeToCamel(options),
      novel_id: options.novelId,
    }

    return this.request<RequestType, PostV1NovelBookmarkDeleteResponse>({
      method: 'POST',
      path: '/v1/novel/bookmark/delete',
      data,
    })
  }

  // ---------- ユーザ ---------- //

  /**
   * ユーザの詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async userDetail(options: UserDetailOptions) {
    type RequestType = GetV1UserDetailRequest
    this.checkRequiredOptions(options, ['userId'])
    const parameters = {
      ...this.convertSnakeToCamel(options),
      user_id: options.userId,
      filter: options.filter || Filter.FOR_IOS,
    }

    return this.request<RequestType, GetV1UserDetailResponse>({
      method: 'GET',
      path: '/v1/user/detail',
      params: parameters,
    })
  }

  /**
   * ユーザのイラストブックマークを取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async userBookmarksIllust(options: UserBookmarksIllustOptions) {
    type RequestType = GetV1UserBookmarksIllustRequest
    this.checkRequiredOptions(options, ['userId'])
    const parameters = {
      ...this.convertSnakeToCamel(options),
      user_id: options.userId,
      restrict: options.restrict || BookmarkRestrict.PUBLIC,
      filter: options.filter || Filter.FOR_IOS,
      max_bookmark_id: options.maxBookmarkId || undefined,
      tag: options.tag || undefined,
    }

    return this.request<RequestType, GetV1UserBookmarksIllustResponse>({
      method: 'GET',
      path: '/v1/user/bookmarks/illust',
      params: parameters,
    })
  }

  /**
   * ユーザの小説ブックマークを取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async userBookmarksNovel(options: UserBookmarksNovelOptions) {
    type RequestType = GetV1UserBookmarksNovelRequest
    this.checkRequiredOptions(options, ['userId'])
    const parameters = {
      ...this.convertSnakeToCamel(options),
      user_id: options.userId,
      restrict: options.restrict || BookmarkRestrict.PUBLIC,
      max_bookmark_id: options.maxBookmarkId || undefined,
      tag: options.tag || undefined,
    }

    return this.request<RequestType, GetV1UserBookmarksNovelResponse>({
      method: 'GET',
      path: '/v1/user/bookmarks/novel',
      params: parameters,
    })
  }

  // ---------- ユーティリティ ---------- //

  /**
   * クエリストリングをパースする。
   *
   * @param url URL
   * @returns パースしたクエリストリングオブジェクト
   */
  public static parseQueryString(url: string) {
    let query = url
    if (url.includes('?')) {
      query = url.split('?')[1]
    }

    return qs.parse(query)
  }

  /**
   * レスポンスがエラーかどうかを判定する。
   *
   * @param response Axios レスポンス
   * @returns エラーかどうか
   */
  public static isError(response: any): response is PixivApiError {
    return (
      response.error !== undefined &&
      response.error.user_message !== undefined &&
      response.error.message !== undefined &&
      response.error.reason !== undefined
    )
  }

  /**
   * MD5ハッシュを生成する。
   *
   * @param str 文字列
   * @returns ハッシュ
   */
  private static hash(string: string) {
    const hash = crypto.createHash('md5')
    return hash.update(string + this.hashSecret).digest('hex')
  }

  /**
   * リクエストを送信する。
   *
   * ジェネリクスの順番は、T: リクエスト、U: レスポンス。
   *
   * @param options オプション
   * @returns レスポンス
   */
  private request<T, U>(options: RequestOptions<T>): Promise<AxiosResponse<U>> {
    if (options.method === 'GET') {
      return this.axios.get<U>(options.path, {
        params: options.params,
        paramsSerializer: { indexes: null },
      })
    }
    if (options.method === 'POST') {
      return this.axios.post<U>(options.path, qs.stringify(options.data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        paramsSerializer: { indexes: null },
      })
    }
    throw new Error('Invalid method')
  }

  /**
   * 必須のオプションが含まれているかどうかをチェックする。
   *
   * @param options オプション
   * @param required 必須のオプションキー
   * @throws 必須のオプションが含まれていない場合
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
   * スネークケースのオブジェクトキーをキャメルケースなオブジェクトキーに変換する。
   *
   * @param object オブジェクト
   * @returns 変換後のオブジェクト
   */
  private convertSnakeToCamel(object: Record<string, any>) {
    const result: Record<string, any> = {}
    for (const key of Object.keys(object)) {
      const camelKey = key.replace(/_([a-z])/g, (m) => m[1].toUpperCase())
      result[camelKey] = object[key]
    }
    return result
  }
}
