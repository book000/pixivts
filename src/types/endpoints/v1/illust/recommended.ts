import { PixivIllustItem } from '../../../pixiv-illust'
import { Filter } from '../../../../options'
import { PrivacyPolicy } from '../../../pixiv-common'

// @ts-ignore because tsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pixiv from '../../../pixiv'

/**
 * GET /v1/illust/recommended のリクエスト
 */
export interface GetV1IllustRecommendedRequest {
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
   * 最近のイラストの最小ブックマークID (?)
   *
   * @default undefined
   * @beta
   */
  min_bookmark_id_for_recent_illust?: number

  /**
   * おすすめイラストの最大ブックマークID (?)
   *
   * @default undefined
   * @beta
   */
  max_bookmark_id_for_recommend?: number

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
 * GET /v1/illust/recommended のレスポンス
 */
export interface GetV1IllustRecommendedResponse {
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
   * コンテストが存在するか？
   *
   * @beta
   */
  contest_exists: boolean

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
