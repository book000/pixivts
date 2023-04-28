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
} from './options'
import { PostV2IllustBookmarkAddResponse } from './types/endpoints/illust/bookmark/add'
import { GetV1IllustDetailResponse } from './types/endpoints/illust/detail'
import { GetV1RecommendedIllustResponse } from './types/endpoints/illust/recommended'
import { GetV2NovelDetailResponse } from './types/endpoints/novel/detail'
import { GetV1RecommendedNovelResponse } from './types/endpoints/novel/recommended'
import { GetV2NovelSeriesResponse } from './types/endpoints/novel/series'
import { GetV1SearchIllustResponse } from './types/endpoints/search/illust'
import { GetV1SearchNovelResponse } from './types/endpoints/search/novel'
import { GetV1UserDetailResponse } from './types/endpoints/user/detail'
import { GetV1IllustSeriesResponse } from './types/endpoints/illust/series'
import { GetV1NovelTextResponse } from './types/endpoints/novel/text'
import { PixivApiError } from './types/error-response'

interface RequestOptions {
  method: 'GET' | 'POST'
  path: string
  params?: Record<string, any>
  data?: Record<string, any>
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
      'app-os-version': '14.6',
      'user-agent': 'PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)',
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

  /**
   * イラストの詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async illustDetail(options: IllustDetailOptions) {
    const parameters = {
      illust_id: options.illustId,
    }

    return this.request<GetV1IllustDetailResponse>({
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
    const parameters = {
      word: options.word, // required
      searchTarget: options.searchTarget || 'partial_match_for_tags',
      sort: options.sort || 'date_desc',
      duration: options.duration,
      startDate: options.startDate,
      endDate: options.endDate,
      filter: options.filter || 'for_ios',
      offset: options.offset,
    }

    return this.request<GetV1SearchIllustResponse>({
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
  public async recommendedIllust(options: RecommendedIllustOptions) {
    const parameters = {
      content_type: options.contentType,
      include_ranking_label: options.includeRankingLabel || true,
      filter: options.filter || 'for_ios',
      max_bookmark_id_for_recommend:
        options.maxBookmarkIdForRecommend || undefined,
      min_bookmark_id_for_recent_illust:
        options.minBookmarkIdForRecentIllust || undefined,
      offset: options.offset || undefined,
      include_ranking_illusts: options.includeRankingIllusts || undefined,
      bookmark_illust_ids: options.bookmarkIllustIds
        ? options.bookmarkIllustIds.join(',')
        : undefined,
      include_privacy_policy: options.includePrivacyPolicy || undefined,
    }

    return this.request<GetV1RecommendedIllustResponse>({
      method: 'GET',
      path: '/v1/illust/recommended',
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
    const data = {
      illust_id: options.illustId,
      restrict: options.restrict || 'public',
      'tags[]': (options.tags || []).join(' '),
    }

    return this.request<PostV2IllustBookmarkAddResponse>({
      method: 'POST',
      path: '/v2/illust/bookmark/add',
      data,
    })
  }

  /**
   * イラストシリーズの詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async illustSeries(options: IllustSeriesOptions) {
    const parameters = {
      illust_series_id: options.illustSeriesId,
      filter: options.filter || 'for_ios',
      offset: options.offset,
    }

    return this.request<GetV1IllustSeriesResponse>({
      method: 'GET',
      path: '/v1/illust/series',
      params: parameters,
    })
  }

  /**
   * 小説の詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async novelDetail(options: NovelDetailOptions) {
    const parameters = {
      novel_id: options.novelId,
    }

    return this.request<GetV2NovelDetailResponse>({
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
    const parameters = {
      novel_id: options.novelId,
    }

    return this.request<GetV1NovelTextResponse>({
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
    const parameters = {
      word: options.word, // required
      searchTarget: options.searchTarget || 'partial_match_for_tags',
      sort: options.sort || 'date_desc',
      merge_plain_keyword_results: options.mergePlainKeywordResults || true,
      include_translated_tag_results:
        options.includeTranslatedTagResults || true,
      startDate: options.startDate,
      endDate: options.endDate,
      filter: options.filter || 'for_ios',
      offset: options.offset,
    }

    return this.request<GetV1SearchNovelResponse>({
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
  public async recommendedNovel(options: RecommendedNovelOptions = {}) {
    const parameters = {
      include_ranking_label: options.includeRankingLabel || true,
      filter: options.filter || 'for_ios',
      offset: options.offset || undefined,
      include_ranking_novels: options.includeRankingNovels || undefined,
      already_recommended: options.alreadyRecommended
        ? options.alreadyRecommended.join(',')
        : undefined,
      max_bookmark_id_for_recommend:
        options.maxBookmarkIdForRecommend || undefined,
      include_privacy_policy: options.includePrivacyPolicy || undefined,
    }

    return this.request<GetV1RecommendedNovelResponse>({
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
    const parameters = {
      series_id: options.seriesId,
      filter: options.filter || 'for_ios',
      last_order: options.lastOrder || undefined,
    }

    return this.request<GetV2NovelSeriesResponse>({
      method: 'GET',
      path: '/v2/novel/series',
      params: parameters,
    })
  }

  /**
   * ユーザーの詳細情報を取得する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  public async userDetail(options: UserDetailOptions) {
    const parameters = {
      user_id: options.userId,
      filter: options.filter || 'for_ios',
    }

    return this.request<GetV1UserDetailResponse>({
      method: 'GET',
      path: '/v1/user/detail',
      params: parameters,
    })
  }

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
  private static hash(string_: string) {
    const hash = crypto.createHash('md5')
    return hash.update(string_ + this.hashSecret).digest('hex')
  }

  /**
   * リクエストを送信する。
   *
   * @param options オプション
   * @returns レスポンス
   */
  private request<T>(options: RequestOptions): Promise<AxiosResponse<T>> {
    if (options.method === 'GET') {
      return this.axios.get<T>(options.path, { params: options.params })
    }
    if (options.method === 'POST') {
      return this.axios.post<T>(options.path, qs.stringify(options.data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    }
    throw new Error('Invalid method')
  }
}
