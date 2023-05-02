import { PixivIllustItem } from '../../../pixiv-illust'
import { Filter } from '../../../../options'
import { PrivacyPolicy } from '../../../pixiv-common'

// @ts-ignore because tsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pixiv from '../../../pixiv'

/**
 * GET /v1/manga/recommended のリクエスト
 */
export interface GetV1MangaRecommendedRequest {
  /**
   * OSフィルタ
   *
   * @default 'for_ios'
   */
  filter: Filter

  /**
   * ランキングイラストを含めるか (?)
   *
   * @default true
   * @beta
   */
  include_ranking_illusts: boolean

  /**
   * 最大ブックマークID (?)
   *
   * @default undefined
   * @beta
   */
  max_bookmark_id?: number

  /**
   * オフセット
   *
   * @default undefined
   */
  offset?: string

  /**
   * プライバシーポリシーを含めるか (?)
   *
   * @default true
   * @beta
   */
  include_privacy_policy: boolean

  /**
   * 閲覧済みのイラストID
   */
  // 面倒なので対応しない
  // viewed?: Record<string, string>
}

/**
 * GET /v1/manga/recommended のレスポンス
 */
export interface GetV1MangaRecommendedResponse {
  /**
   * おすすめのイラスト群
   */
  illusts: PixivIllustItem[]

  /**
   * ランキングのイラスト群？
   *
   * @beta
   */
  ranking_illusts: PixivIllustItem[]

  /**
   * プライバシーポリシー
   */
  privacy_policy?: PrivacyPolicy[]

  /**
   * 次回のリクエストに使用する URL。
   *
   * @see {Pixiv.parseQueryString}
   */
  next_url: string
}
